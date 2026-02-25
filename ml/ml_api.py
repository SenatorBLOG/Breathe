# ml_api.py
# Запускается командой: uvicorn ml_api:app --reload --port 8000

from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from typing import Optional

app = FastAPI(title="Meditation Recommender ML API")

# Загружаем модель (pipeline), сохранённую в train_model.py
MODEL_PATH = "meditation_model.joblib"
model = joblib.load(MODEL_PATH)

class PredictRequest(BaseModel):
    text: str
    stress_level: Optional[float] = None  # 1..10
    time_of_day: Optional[str] = None     # morning/afternoon/evening/night

class PredictResponse(BaseModel):
    input: dict
    recommendation: str
    probabilities: dict

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    # Собираем DataFrame с теми же колонками, что использовались при обучении
    row = {
        "text": req.text,
        "stress_level": req.stress_level if req.stress_level is not None else 5.0,
        "time_of_day": req.time_of_day if req.time_of_day is not None else "evening"
    }
    X = pd.DataFrame([row])

    # Предсказание
    pred = model.predict(X)[0]

    # Вероятности для всех классов (если модель поддерживает)
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

# Лёгкий health check
@app.get("/health")
def health():
    return {"status": "ok"}