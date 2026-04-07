# retrain_scheduler.py
# Запускается по расписанию (cron, Airflow, systemd timer)
# Пример cron: 0 2 * * 0 /usr/bin/python /path/to/retrain_scheduler.py

import os
import sys
import json
import sqlite3
import logging
from datetime import datetime, timedelta
from pathlib import Path

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('retrain.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Конфигурация
DB_PATH = "user_sessions.db"
MIN_SAMPLES = 50          # Минимум новых сэмплов для переобучения
MIN_ACCURACY = 0.75       # Минимальная точность модели
MAX_DAYS_WITHOUT_RETRAIN = 7  # Максимум дней без переобучения

class RetrainScheduler:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        
    def get_stats(self) -> dict:
        """Собирает статистику по данным."""
        cursor = self.conn.cursor()
        
        # Всего сэмплов
        cursor.execute("SELECT COUNT(*) FROM sessions WHERE label IS NOT NULL")
        total_samples = cursor.fetchone()[0]
        
        # Новых сэмплов с момента последнего обучения
        cursor.execute("""
            SELECT COUNT(*) FROM sessions 
            WHERE label IS NOT NULL 
            AND (used_for_training = FALSE OR used_for_training IS NULL)
        """)
        new_samples = cursor.fetchone()[0]
        
        # Распределение по классам
        cursor.execute("""
            SELECT label, COUNT(*) FROM sessions 
            WHERE label IS NOT NULL 
            GROUP BY label
        """)
        class_distribution = dict(cursor.fetchall())
        
        # Время последнего обучения
        cursor.execute("SELECT last_train_time FROM model_metadata WHERE id = 1")
        result = cursor.fetchone()
        last_train = result[0] if result else None
        
        # Дней с последнего обучения
        days_since_train = None
        if last_train:
            last_train_dt = datetime.fromisoformat(last_train)
            days_since_train = (datetime.now() - last_train_dt).days
        
        return {
            "total_samples": total_samples,
            "new_samples": new_samples,
            "class_distribution": class_distribution,
            "last_train_time": last_train,
            "days_since_train": days_since_train
        }
    
    def should_retrain(self, stats: dict) -> tuple[bool, str]:
        """Определяет, нужно ли переобучение."""
        reasons = []
        
        # Достаточно новых данных
        if stats["new_samples"] >= MIN_SAMPLES:
            reasons.append(f"{stats['new_samples']} new samples")
        
        # Давно не переобучали
        if stats["days_since_train"] and stats["days_since_train"] >= MAX_DAYS_WITHOUT_RETRAIN:
            reasons.append(f"{stats['days_since_train']} days since last train")
        
        # Дисбаланс классов (если какой-то класс < 10%)
        if stats["class_distribution"]:
            total = sum(stats["class_distribution"].values())
            for cls, count in stats["class_distribution"].items():
                if count / total < 0.1:
                    reasons.append(f"class imbalance: {cls} is {count/total:.1%}")
                    break
        
        should = len(reasons) > 0
        return should, ", ".join(reasons) if reasons else "no retrain needed"
    
    def run_retrain(self) -> dict:
        """Запускает переобучение."""
        logger.info("Starting retrain...")
        
        try:
            # Импортируем функцию обучения
            from train_incremental import train_full, load_data_from_db
            
            # Загружаем данные
            df = load_data_from_db(self.db_path)
            
            # Обучаем
            model = train_full(df)
            
            # Отмечаем сэмплы как использованные
            cursor = self.conn.cursor()
            cursor.execute("""
                UPDATE sessions SET used_for_training = TRUE 
                WHERE label IS NOT NULL AND used_for_training = FALSE
            """)
            
            # Обновляем метаданные
            version = f"v{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            cursor.execute("""
                UPDATE model_metadata 
                SET last_train_time = ?, model_version = ?, samples_count = ?
                WHERE id = 1
            """, (datetime.now().isoformat(), version, len(df)))
            
            self.conn.commit()
            
            logger.info(f"Retrain completed. Model version: {version}")
            return {"success": True, "version": version, "samples": len(df)}
            
        except Exception as e:
            logger.error(f"Retrain failed: {e}")
            return {"success": False, "error": str(e)}
    
    def generate_report(self, stats: dict, retrain_result: dict = None) -> str:
        """Генерирует отчёт о переобучении."""
        report = []
        report.append("=" * 50)
        report.append(f"Retrain Report - {datetime.now().isoformat()}")
        report.append("=" * 50)
        report.append(f"Total samples: {stats['total_samples']}")
        report.append(f"New samples: {stats['new_samples']}")
        report.append(f"Days since last train: {stats['days_since_train']}")
        report.append(f"Class distribution: {stats['class_distribution']}")
        
        if retrain_result:
            if retrain_result.get("success"):
                report.append(f"\n✅ Retrain SUCCESS")
                report.append(f"Model version: {retrain_result['version']}")
                report.append(f"Samples used: {retrain_result['samples']}")
            else:
                report.append(f"\n❌ Retrain FAILED")
                report.append(f"Error: {retrain_result.get('error')}")
        else:
            report.append("\n⏭️ No retrain needed")
        
        return "\n".join(report)
    
    def close(self):
        self.conn.close()

def main():
    """Главная функция для запуска по расписанию."""
    scheduler = RetrainScheduler()
    
    try:
        # Собираем статистику
        stats = scheduler.get_stats()
        logger.info(f"Stats: {stats}")
        
        # Проверяем нужно ли переобучение
        should_retrain, reason = scheduler.should_retrain(stats)
        logger.info(f"Should retrain: {should_retrain}, reason: {reason}")
        
        result = None
        if should_retrain:
            result = scheduler.run_retrain()
        
        # Генерируем отчёт
        report = scheduler.generate_report(stats, result)
        print(report)
        
        # Сохраняем отчёт
        report_path = Path("retrain_reports") / f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        report_path.parent.mkdir(exist_ok=True)
        report_path.write_text(report)
        
        # Выходной код для мониторинга
        sys.exit(0 if (result is None or result.get("success")) else 1)
        
    finally:
        scheduler.close()

if __name__ == "__main__":
    main()