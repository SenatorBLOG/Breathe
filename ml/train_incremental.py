# train_incremental.py
# Поддерживает инкрементальное обучение и полное переобучение

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import classification_report, accuracy_score, log_loss
import joblib
import json
import os
from datetime import datetime
from typing import List, Dict, Optional
import sqlite3

# -------------------------
# Конфигурация
# -------------------------
MODEL_PATH = "meditation_model_incremental.joblib"
DB_PATH = "user_sessions.db"
METRICS_PATH = "model_metrics.json"
MIN_SAMPLES_FOR_RETRAIN = 50  # Минимум новых сэмплов для переобучения

# -------------------------
# 1) Загрузка данных из БД
# -------------------------
def load_data_from_db(db_path: str = DB_PATH) -> pd.DataFrame:
    """
    Загружает данные из SQLite базы.
    Ожидаемая схема:
    - user_id: int
    - text: str (описание состояния)
    - stress_level: float (1-10)
    - time_of_day: str (morning/afternoon/evening/night)
    - label: str (breathing/sleep/focus/relaxation) - выбор пользователя
    - duration: int (длительность сессии в секундах)
    - rating: int (оценка 1-5)
    - timestamp: datetime
    """
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found. Creating sample data...")
        return create_sample_data()
    
    conn = sqlite3.connect(db_path)
    query = """
        SELECT text, stress_level, time_of_day, label, duration, rating
        FROM sessions 
        WHERE label IS NOT NULL
    """
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    if len(df) < 10:
        print(f"Only {len(df)} samples in DB. Adding sample data...")
        sample_df = create_sample_data()
        df = pd.concat([df, sample_df], ignore_index=True)
    
    return df

def create_sample_data() -> pd.DataFrame:
    """Создаёт расширенный набор примеров для старта."""
    data = [
        # Sleep
        {"text": "Can't sleep at night", "stress_level": 7, "time_of_day": "night", "label": "sleep", "duration": 600, "rating": 4},
        {"text": "Tired and can't fall asleep", "stress_level": 6, "time_of_day": "night", "label": "sleep", "duration": 900, "rating": 5},
        {"text": "Feeling tired, want deep rest", "stress_level": 4, "time_of_day": "afternoon", "label": "sleep", "duration": 300, "rating": 3},
        {"text": "Insomnia, mind racing", "stress_level": 8, "time_of_day": "night", "label": "sleep", "duration": 1200, "rating": 5},
        {"text": "Need help falling asleep", "stress_level": 5, "time_of_day": "evening", "label": "sleep", "duration": 600, "rating": 4},
        
        # Breathing
        {"text": "I have a headache and feel stressed", "stress_level": 8, "time_of_day": "evening", "label": "breathing", "duration": 300, "rating": 4},
        {"text": "My head hurts after long screen time", "stress_level": 5, "time_of_day": "evening", "label": "breathing", "duration": 180, "rating": 3},
        {"text": "Stress and mild headache after work", "stress_level": 6, "time_of_day": "evening", "label": "breathing", "duration": 300, "rating": 4},
        {"text": "Shortness of breath, feeling anxious", "stress_level": 9, "time_of_day": "afternoon", "label": "breathing", "duration": 240, "rating": 5},
        {"text": "Chest tightness from stress", "stress_level": 7, "time_of_day": "morning", "label": "breathing", "duration": 300, "rating": 4},
        
        # Focus
        {"text": "Need help focusing for study", "stress_level": 3, "time_of_day": "morning", "label": "focus", "duration": 300, "rating": 5},
        {"text": "Short guided session to get focused", "stress_level": 2, "time_of_day": "morning", "label": "focus", "duration": 180, "rating": 4},
        {"text": "Can't concentrate on work", "stress_level": 4, "time_of_day": "afternoon", "label": "focus", "duration": 300, "rating": 4},
        {"text": "Distracted, need clarity", "stress_level": 5, "time_of_day": "morning", "label": "focus", "duration": 240, "rating": 5},
        {"text": "Preparing for exam, need focus", "stress_level": 6, "time_of_day": "evening", "label": "focus", "duration": 600, "rating": 5},
        
        # Relaxation
        {"text": "Panic attack, very anxious", "stress_level": 9, "time_of_day": "afternoon", "label": "relaxation", "duration": 600, "rating": 5},
        {"text": "Need to calm down and relax muscles", "stress_level": 8, "time_of_day": "evening", "label": "relaxation", "duration": 900, "rating": 5},
        {"text": "Feeling overwhelmed", "stress_level": 7, "time_of_day": "afternoon", "label": "relaxation", "duration": 600, "rating": 4},
        {"text": "Anxiety before presentation", "stress_level": 8, "time_of_day": "morning", "label": "relaxation", "duration": 300, "rating": 5},
        {"text": "Just need to relax", "stress_level": 4, "time_of_day": "evening", "label": "relaxation", "duration": 600, "rating": 4},
    ]
    return pd.DataFrame(data)

# -------------------------
# 2) Feature Engineering
# -------------------------
def create_feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    """Добавляет новые признаки."""
    df = df.copy()
    
    # Время суток как числовой признак (циклический)
    time_map = {"morning": 0, "afternoon": 1, "evening": 2, "night": 3}
    df["time_encoded"] = df["time_of_day"].map(time_map)
    
    # Взаимодействие признаков
    df["stress_time"] = df["stress_level"] * df["time_encoded"]
    
    # Длительность категоризированная
    df["duration_category"] = pd.cut(df["duration"], 
                                       bins=[0, 180, 300, 600, 1200, float('inf')],
                                       labels=["short", "medium", "long", "extended", "deep"])
    
    # Рейтинг как вес (для взвешенного обучения)
    df["sample_weight"] = df["rating"] / 5.0
    
    return df

# -------------------------
# 3) Создание пайплайна
# -------------------------
def create_pipeline() -> Pipeline:
    """Создаёт пайплайн с SGDClassifier для инкрементального обучения."""
    
    text_pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 3), max_features=5000, min_df=2))
    ])
    
    num_pipeline = Pipeline([
        ("scaler", StandardScaler())
    ])
    
    cat_pipeline = Pipeline([
        ("onehot", OneHotEncoder(handle_unknown="ignore"))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("text", text_pipeline, "text"),
            ("num", num_pipeline, ["stress_level", "time_encoded", "stress_time"]),
            ("cat", cat_pipeline, ["time_of_day", "duration_category"])
        ]
    )
    
    # SGDClassifier поддерживает partial_fit
    clf = Pipeline([
        ("preproc", preprocessor),
        ("clf", SGDClassifier(
            loss='log_loss',  # логистическая регрессия
            penalty='elasticnet',
            alpha=0.0001,
            l1_ratio=0.15,
            max_iter=1000,
            tol=1e-3,
            random_state=42,
            learning_rate='adaptive',
            eta0=0.01
        ))
    ])
    
    return clf

# -------------------------
# 4) Обучение
# -------------------------
def train_full(df: pd.DataFrame, save_path: str = MODEL_PATH) -> Pipeline:
    """Полное переобучение на всех данных."""
    print(f"Training on {len(df)} samples...")
    
    df = create_feature_engineering(df)
    
    X = df[["text", "stress_level", "time_of_day", "time_encoded", "stress_time", "duration_category"]]
    y = df["label"]
    weights = df["sample_weight"]
    
    X_train, X_test, y_train, y_test, w_train, w_test = train_test_split(
        X, y, weights, test_size=0.2, random_state=42, stratify=y
    )
    
    clf = create_pipeline()
    clf.fit(X_train, y_train, clf__sample_weight=w_train)
    
    # Оценка
    y_pred = clf.predict(X_test)
    y_proba = clf.predict_proba(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    loss = log_loss(y_test, y_proba, sample_weight=w_test)
    
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Log Loss: {loss:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Сохранение
    joblib.dump(clf, save_path)
    print(f"\nModel saved to {save_path}")
    
    # Сохранение метрик
    metrics = {
        "timestamp": datetime.now().isoformat(),
        "samples": len(df),
        "accuracy": float(accuracy),
        "log_loss": float(loss),
        "classes": list(clf.classes_)
    }
    with open(METRICS_PATH, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    return clf

def train_incremental(new_data: List[Dict], model_path: str = MODEL_PATH) -> Optional[Pipeline]:
    """
    Инкрементальное обучение на новых данных.
    
    Args:
        new_data: Список словарей с новыми сессиями
        model_path: Путь к существующей модели
    
    Returns:
        Обновлённая модель или None если данных недостаточно
    """
    if len(new_data) < MIN_SAMPLES_FOR_RETRAIN:
        print(f"Need at least {MIN_SAMPLES_FOR_RETRAIN} samples, got {len(new_data)}")
        return None
    
    # Загрузка существующей модели
    if not os.path.exists(model_path):
        print("No existing model found. Training from scratch...")
        df = pd.DataFrame(new_data)
        return train_full(df, model_path)
    
    clf = joblib.load(model_path)
    
    # Подготовка новых данных
    df = pd.DataFrame(new_data)
    df = create_feature_engineering(df)
    
    X = df[["text", "stress_level", "time_of_day", "time_encoded", "stress_time", "duration_category"]]
    y = df["label"]
    weights = df["sample_weight"]
    
    # partial_fit
    # Примечание: для ColumnTransformer + SGD нужно вручную трансформировать
    X_transformed = clf.named_steps['preproc'].transform(X)
    clf.named_steps['clf'].partial_fit(X_transformed, y, classes=['breathing', 'sleep', 'focus', 'relaxation'], sample_weight=weights)
    
    joblib.dump(clf, model_path)
    print(f"Model updated with {len(new_data)} new samples")
    
    return clf

# -------------------------
# 5) Периодическое переобучение
# -------------------------
def should_retrain(db_path: str = DB_PATH) -> bool:
    """Проверяет, нужно ли переобучение."""
    if not os.path.exists(db_path):
        return False
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Проверяем количество новых сэмплов с момента последнего обучения
    cursor.execute("""
        SELECT COUNT(*) FROM sessions 
        WHERE label IS NOT NULL 
        AND timestamp > (SELECT MAX(last_train_time) FROM model_metadata WHERE id = 1)
    """)
    new_count = cursor.fetchone()[0]
    conn.close()
    
    return new_count >= MIN_SAMPLES_FOR_RETRAIN

def scheduled_retrain():
    """Запускается по расписанию (cron/airflow)."""
    print(f"[{datetime.now()}] Checking for retrain...")
    
    if not should_retrain():
        print("No retrain needed")
        return
    
    df = load_data_from_db()
    train_full(df)
    
    # Обновляем timestamp
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO model_metadata (id, last_train_time) 
        VALUES (1, ?)
    """, (datetime.now().isoformat(),))
    conn.commit()
    conn.close()

# -------------------------
# 6) Main
# -------------------------
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "incremental":
        # Режим инкрементального обучения
        # Ожидаем JSON с новыми данными в stdin
        new_data = json.load(sys.stdin)
        train_incremental(new_data)
    elif len(sys.argv) > 1 and sys.argv[1] == "scheduled":
        # Периодическое переобучение
        scheduled_retrain()
    else:
        # Полное переобучение
        df = load_data_from_db()
        train_full(df)