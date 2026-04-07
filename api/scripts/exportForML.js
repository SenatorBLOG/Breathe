// scripts/exportForML.js
// Экспортирует данные из MongoDB для обучения ML модели
// Запуск: node scripts/exportForML.js

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Session = require('../models/Session');

const ML_DATA_PATH = path.join(__dirname, '../../ml/training_data.json');

async function exportForML() {
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Получаем сессии с выбором пользователя
    const sessions = await Session.find({
      userChoice: { $ne: null },
      rating: { $ne: null }
    }).lean();
    
    console.log(`📊 Found ${sessions.length} sessions with user feedback`);
    
    if (sessions.length === 0) {
      console.log('⚠️ No training data available');
      process.exit(0);
    }
    
    // Преобразуем в формат для ML
    const trainingData = sessions.map(s => ({
      user_id: s.userId.toString(),
      text: s.notes || '',
      stress_level: s.stressLevel || 5,
      time_of_day: s.timeOfDay || 'evening',
      label: s.userChoice,
      duration: (s.sessionLength || 0) * 60,
      rating: s.rating,
      timestamp: s.sessionDate
    }));
    
    // Статистика по классам
    const classDistribution = {};
    trainingData.forEach(d => {
      classDistribution[d.label] = (classDistribution[d.label] || 0) + 1;
    });
    
    console.log('\n📈 Class distribution:');
    Object.entries(classDistribution).forEach(([cls, count]) => {
      const pct = ((count / trainingData.length) * 100).toFixed(1);
      console.log(`  ${cls}: ${count} (${pct}%)`);
    });
    
    // Сохраняем в JSON
    const output = {
      exported_at: new Date().toISOString(),
      total_samples: trainingData.length,
      class_distribution: classDistribution,
      data: trainingData
    };
    
    fs.writeFileSync(ML_DATA_PATH, JSON.stringify(output, null, 2));
    console.log(`\n✅ Exported to ${ML_DATA_PATH}`);
    
    // Отмечаем сессии как использованные
    const sessionIds = sessions.map(s => s._id);
    await Session.updateMany(
      { _id: { $in: sessionIds } },
      { usedForTraining: true }
    );
    console.log(`✅ Marked ${sessionIds.length} sessions as used for training`);
    
  } catch (err) {
    console.error('❌ Export failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Если запущен напрямую
if (require.main === module) {
  exportForML();
}

module.exports = { exportForML };