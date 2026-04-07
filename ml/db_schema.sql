-- Схема базы данных для хранения сессий медитации
-- Запуск: sqlite3 user_sessions.db < db_schema.sql

-- Таблица сессий пользователей
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    text TEXT NOT NULL,              -- Описание состояния пользователя
    stress_level REAL,              -- Уровень стресса 1-10
    time_of_day TEXT,               -- morning/afternoon/evening/night
    label TEXT,                     -- Выбор пользователя: breathing/sleep/focus/relaxation
    duration INTEGER,               -- Длительность сессии в секундах
    rating INTEGER,                 -- Оценка 1-5
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_for_training BOOLEAN DEFAULT FALSE,  -- Использовано для обучения?
    model_version TEXT              -- Версия модели, которая дала рекомендацию
);

-- Таблица метаданных модели
CREATE TABLE IF NOT EXISTS model_metadata (
    id INTEGER PRIMARY KEY,
    last_train_time DATETIME,
    model_version TEXT,
    samples_count INTEGER,
    accuracy REAL
);

-- Таблица feedback (явный feedback от пользователей)
CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    user_id TEXT NOT NULL,
    recommended_label TEXT,         -- Что рекомендовала модель
    user_choice TEXT,                 -- Что выбрал пользователь
    was_helpful BOOLEAN,              -- Помогло ли?
    feedback_text TEXT,               -- Текстовый отзыв
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_timestamp ON sessions(timestamp);
CREATE INDEX IF NOT EXISTS idx_sessions_training ON sessions(used_for_training);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);

-- Вставка начальной записи метаданных
INSERT OR IGNORE INTO model_metadata (id, last_train_time, model_version, samples_count, accuracy)
VALUES (1, '1970-01-01', 'v0.0', 0, 0.0);