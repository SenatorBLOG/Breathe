# train_model.py
# Запускается в Jupyter (ячейка) или как: python train_model.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
import joblib

# -------------------------
# 1) Примерный dataset
# (замени/дополни своими реальными примерами)
# -------------------------
data = [
    {"text": "I have a headache and feel stressed", "stress_level": 8, "time_of_day": "evening", "label": "breathing"},
    {"text": "Can't sleep at night", "stress_level": 7, "time_of_day": "night", "label": "sleep"},
    {"text": "Need help focusing for study", "stress_level": 3, "time_of_day": "morning", "label": "focus"},
    {"text": "Panic attack, very anxious", "stress_level": 9, "time_of_day": "afternoon", "label": "relaxation"},
    {"text": "Tired and can't fall asleep", "stress_level": 6, "time_of_day": "night", "label": "sleep"},
    {"text": "My head hurts after long screen time", "stress_level": 5, "time_of_day": "evening", "label": "breathing"},
    {"text": "Need to calm down and relax muscles", "stress_level": 8, "time_of_day": "evening", "label": "relaxation"},
    {"text": "Short guided session to get focused", "stress_level": 2, "time_of_day": "morning", "label": "focus"},
    {"text": "Feeling tired, want deep rest", "stress_level": 4, "time_of_day": "afternoon", "label": "sleep"},
    {"text": "Stress and mild headache after work", "stress_level": 6, "time_of_day": "evening", "label": "breathing"},
    # добавь больше строк — чем больше, тем лучше
]

df = pd.DataFrame(data)

# -------------------------
# 2) Train/test split
# -------------------------
X = df[["text", "stress_level", "time_of_day"]]
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# -------------------------
# 3) ColumnTransformer: текст -> TF-IDF, числовые -> scaler, категориальные -> one-hot
# -------------------------
text_pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1,2), max_features=2000))
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
        ("num", num_pipeline, ["stress_level"]),
        ("cat", cat_pipeline, ["time_of_day"])
    ]
)

# -------------------------
# 4) Полная pipeline с классификатором
# -------------------------
clf = Pipeline([
    ("preproc", preprocessor),
    ("clf", LogisticRegression(max_iter=1000))
])

# -------------------------
# 5) Обучаем
# -------------------------
clf.fit(X_train, y_train)

# -------------------------
# 6) Оценка
# -------------------------
y_pred = clf.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))

# -------------------------
# 7) Сохраняем pipeline (включая vectorizer и классификатор)
# -------------------------
joblib.dump(clf, "meditation_model.joblib")
print("Saved model to meditation_model.joblib")