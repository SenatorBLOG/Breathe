# ml_api.py
# Запускается командой: uvicorn ml_api:app --reload --port 8000

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import joblib
import pandas as pd
import sqlite3
import os
import json
import threading

app = FastAPI(title="Meditation Recommender ML API")

# CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Конфигурация
# -------------------------
MODEL_PATH = "meditation_model_incremental.joblib"
FALLBACK_MODEL_PATH = "meditation_model.joblib"
DB_PATH = "user_sessions.db"

# -------------------------
# Загрузка модели
# -------------------------
model = None
model_lock = threading.Lock()

def load_model():
    """Загружает модель с fallback."""
    global model
    with model_lock:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
            print(f"Loaded incremental model from {MODEL_PATH}")
        elif os.path.exists(FALLBACK_MODEL_PATH):
            model = joblib.load(FALLBACK_MODEL_PATH)
            print(f"Loaded fallback model from {FALLBACK_MODEL_PATH}")
        else:
            raise RuntimeError("No model found!")
    return model

# Загружаем при старте
load_model()

# -------------------------
# Инициализация БД
# -------------------------
def init_db():
    """Создаёт таблицы если их нет."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            text TEXT NOT NULL,
            stress_level REAL,
            time_of_day TEXT,
            recommended_label TEXT,
            user_choice TEXT,
            duration INTEGER,
            rating INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            used_for_training BOOLEAN DEFAULT FALSE,
            model_version TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER,
            user_id TEXT NOT NULL,
            recommended_label TEXT,
            user_choice TEXT,
            was_helpful BOOLEAN,
            feedback_text TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS model_metadata (
            id INTEGER PRIMARY KEY,
            last_train_time DATETIME,
            model_version TEXT,
            samples_count INTEGER,
            accuracy REAL
        )
    """)
    
    # Индексы
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_timestamp ON sessions(timestamp)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_training ON sessions(used_for_training)")
    
    # Начальная запись
    cursor.execute("""
        INSERT OR IGNORE INTO model_metadata (id, last_train_time, model_version, samples_count, accuracy)
        VALUES (1, '1970-01-01', 'v0.0', 0, 0.0)
    """)
    
    conn.commit()
    conn.close()

init_db()

# -------------------------
# Pydantic модели
# -------------------------
class PredictRequest(BaseModel):
    text: str
    stress_level: Optional[float] = Field(None, ge=1, le=10)
    time_of_day: Optional[str] = None  # morning/afternoon/evening/night

class PredictResponse(BaseModel):
    input: dict
    recommendation: str
    probabilities: dict
    session_id: Optional[int] = None

class SessionRequest(BaseModel):
    user_id: str
    text: str
    stress_level: Optional[float] = Field(None, ge=1, le=10)
    time_of_day: Optional[str] = None
    recommended_label: str
    user_choice: str
    duration: Optional[int] = None  # seconds
    rating: Optional[int] = Field(None, ge=1, le=5)

class FeedbackRequest(BaseModel):
    session_id: Optional[int] = None
    user_id: str
    recommended_label: str
    user_choice: str
    was_helpful: bool
    feedback_text: Optional[str] = None

class StatsResponse(BaseModel):
    total_sessions: int
    total_feedback: int
    class_distribution: dict
    avg_rating: float
    model_version: str
    last_train_time: Optional[str]

# -------------------------
# Эндпоинты
# -------------------------

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    """Делает предсказание и сохраняет сессию."""
    global model
    
    # Проверяем время суток
    valid_times = ["morning", "afternoon", "evening", "night"]
    time_of_day = req.time_of_day if req.time_of_day in valid_times else "evening"
    
    row = {
        "text": req.text,
        "stress_level": req.stress_level if req.stress_level is not None else 5.0,
        "time_of_day": time_of_day
    }
    X = pd.DataFrame([row])
    
    with model_lock:
        pred = model.predict(X)[0]
        
        probs = {}
        if hasattr(model, "predict_proba"):
            proba = model.predict_proba(X)[0]
            classes = model.named_steps["clf"].classes_ if "clf" in model.named_steps else model.classes_
            probs = {c: float(p) for c, p in zip(classes, proba)}
    
    return {
        "input": row,
        "recommendation": pred,
        "probabilities": probs
    }

@app.post("/session")
def save_session(req: SessionRequest):
    """Сохраняет завершённую сессию в БД."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Получаем версию модели
    cursor.execute("SELECT model_version FROM model_metadata WHERE id = 1")
    model_version = cursor.fetchone()[0]
    
    cursor.execute("""
        INSERT INTO sessions 
        (user_id, text, stress_level, time_of_day, recommended_label, user_choice, 
         duration, rating, model_version)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        req.user_id, req.text, req.stress_level, req.time_of_day,
        req.recommended_label, req.user_choice, req.duration, req.rating,
        model_version
    ))
    
    session_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {"status": "saved", "session_id": session_id}

@app.post("/feedback")
def save_feedback(req: FeedbackRequest):
    """Сохраняет feedback пользователя."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO feedback 
        (session_id, user_id, recommended_label, user_choice, was_helpful, feedback_text)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        req.session_id, req.user_id, req.recommended_label,
        req.user_choice, req.was_helpful, req.feedback_text
    ))
    
    feedback_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {"status": "saved", "feedback_id": feedback_id}

@app.get("/stats", response_model=StatsResponse)
def get_stats():
    """Возвращает статистику по данным."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Всего сессий
    cursor.execute("SELECT COUNT(*) FROM sessions")
    total_sessions = cursor.fetchone()[0]
    
    # Всего feedback
    cursor.execute("SELECT COUNT(*) FROM feedback")
    total_feedback = cursor.fetchone()[0]
    
    # Распределение по классам
    cursor.execute("""
        SELECT user_choice, COUNT(*) FROM sessions 
        WHERE user_choice IS NOT NULL 
        GROUP BY user_choice
    """)
    class_distribution = dict(cursor.fetchall())
    
    # Средний рейтинг
    cursor.execute("SELECT AVG(rating) FROM sessions WHERE rating IS NOT NULL")
    avg_rating = cursor.fetchone()[0] or 0.0
    
    # Метаданные модели
    cursor.execute("SELECT model_version, last_train_time FROM model_metadata WHERE id = 1")
    result = cursor.fetchone()
    model_version = result[0] if result else "unknown"
    last_train_time = result[1] if result else None
    
    conn.close()
    
    return {
        "total_sessions": total_sessions,
        "total_feedback": total_feedback,
        "class_distribution": class_distribution,
        "avg_rating": round(avg_rating, 2),
        "model_version": model_version,
        "last_train_time": last_train_time
    }

@app.post("/retrain")
def trigger_retrain(background_tasks: BackgroundTasks):
    """Запускает переобучение в фоне."""
    background_tasks.add_task(run_retrain_task)
    return {"status": "started", "message": "Retraining started in background"}

def run_retrain_task():
    """Фоновая задача переобучения."""
    try:
        from train_incremental import train_full, load_data_from_db
        
        df = load_data_from_db(DB_PATH)
        new_model = train_full(df, MODEL_PATH)
        
        # Перезагружаем модель
        load_model()
        
        # Отмечаем сэмплы как использованные
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("UPDATE sessions SET used_for_training = TRUE WHERE used_for_training = FALSE")
        
        # Обновляем метаданные
        version = f"v{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        cursor.execute("""
            UPDATE model_metadata 
            SET last_train_time = ?, model_version = ?, samples_count = ?
            WHERE id = 1
        """, (datetime.now().isoformat(), version, len(df)))
        
        conn.commit()
        conn.close()
        
        print(f"Retrain completed. New version: {version}")
        
    except Exception as e:
        print(f"Retrain failed: {e}")

@app.get("/health")
def health():
    """Health check с информацией о модели."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT model_version FROM model_metadata WHERE id = 1")
    result = cursor.fetchone()
    conn.close()
    
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_version": result[0] if result else "unknown",
        "db_path": DB_PATH
    }