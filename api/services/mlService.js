// mlService.js
// Интеграция ML API с MongoDB

const axios = require('axios');
const Session = require('../models/Session');

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

/**
 * Получает ML-рекомендацию для пользователя
 * @param {Object} params - Параметры пользователя
 * @param {string} params.text - Описание состояния
 * @param {number} params.stressLevel - Уровень стресса 1-10
 * @param {string} params.timeOfDay - morning/afternoon/evening/night
 * @returns {Promise<Object>} - Рекомендация и вероятности
 */
async function getRecommendation({ text, stressLevel, timeOfDay }) {
  try {
    const response = await axios.post(`${ML_API_URL}/predict`, {
      text: text || '',
      stress_level: stressLevel,
      time_of_day: timeOfDay
    });
    
    return {
      recommendedTechnique: response.data.recommendation,
      confidence: Math.max(...Object.values(response.data.probabilities)),
      probabilities: response.data.probabilities,
      input: response.data.input
    };
  } catch (error) {
    console.error('ML API error:', error.message);
    // Fallback на основе простых правил
    return getFallbackRecommendation(stressLevel, timeOfDay);
  }
}

/**
 * Fallback рекомендация если ML API недоступен
 */
function getFallbackRecommendation(stressLevel, timeOfDay) {
  const timeMap = {
    'night': 'sleep',
    'morning': 'focus',
    'evening': 'relaxation',
    'afternoon': 'breathing'
  };
  
  // Если высокий стресс → breathing или relaxation
  if (stressLevel >= 7) {
    return {
      recommendedTechnique: timeOfDay === 'night' ? 'sleep' : 'breathing',
      confidence: 0.6,
      probabilities: { breathing: 0.4, sleep: 0.2, focus: 0.1, relaxation: 0.3 },
      input: { stress_level: stressLevel, time_of_day: timeOfDay }
    };
  }
  
  return {
    recommendedTechnique: timeMap[timeOfDay] || 'breathing',
    confidence: 0.5,
    probabilities: { breathing: 0.25, sleep: 0.25, focus: 0.25, relaxation: 0.25 },
    input: { stress_level: stressLevel, time_of_day: timeOfDay }
  };
}

/**
 * Сохраняет сессию с ML-рекомендацией
 * @param {Object} sessionData - Данные сессии
 */
async function saveSessionWithRecommendation(sessionData) {
  const { userId, text, stressLevel, timeOfDay, notes } = sessionData;
  
  // Получаем рекомендацию от ML
  const mlRec = await getRecommendation({
    text: text || notes,
    stressLevel,
    timeOfDay
  });
  
  // Создаём сессию
  const session = new Session({
    userId,
    stressLevel,
    timeOfDay,
    notes: text || notes,
    sessionLength: sessionData.duration || 0,
    mlRecommendation: {
      recommendedTechnique: mlRec.recommendedTechnique,
      confidence: mlRec.confidence,
      probabilities: mlRec.probabilities,
      modelVersion: 'v1.0' // TODO: получать от ML API
    }
  });
  
  await session.save();
  
  return {
    sessionId: session._id,
    recommendation: mlRec.recommendedTechnique,
    confidence: mlRec.confidence,
    probabilities: mlRec.probabilities
  };
}

/**
 * Обновляет сессию после выбора пользователя
 * @param {string} sessionId - ID сессии
 * @param {string} userChoice - Выбор пользователя
 * @param {number} rating - Оценка 1-5
 */
async function updateSessionWithChoice(sessionId, userChoice, rating) {
  const session = await Session.findByIdAndUpdate(
    sessionId,
    {
      userChoice,
      rating,
      usedForTraining: false // Будет true после переобучения
    },
    { new: true }
  );
  
  // Отправляем в ML API для сбора данных
  try {
    await axios.post(`${ML_API_URL}/session`, {
      user_id: session.userId.toString(),
      text: session.notes,
      stress_level: session.stressLevel,
      time_of_day: session.timeOfDay,
      recommended_label: session.mlRecommendation?.recommendedTechnique,
      user_choice: userChoice,
      duration: session.sessionLength * 60, // в секундах
      rating
    });
  } catch (error) {
    console.error('Failed to send to ML API:', error.message);
    // Не критично, данные уже в MongoDB
  }
  
  return session;
}

/**
 * Получает данные для обучения из MongoDB
 * @param {number} limit - Максимум сэмплов
 * @param {boolean} onlyNew - Только неиспользованные
 */
async function getTrainingData(limit = 10000, onlyNew = true) {
  const query = {
    userChoice: { $ne: null },
    rating: { $ne: null }
  };
  
  if (onlyNew) {
    query.usedForTraining = false;
  }
  
  const sessions = await Session.find(query)
    .limit(limit)
    .sort({ sessionDate: -1 })
    .lean();
  
  return sessions.map(s => ({
    user_id: s.userId.toString(),
    text: s.notes || '',
    stress_level: s.stressLevel,
    time_of_day: s.timeOfDay,
    label: s.userChoice,
    duration: (s.sessionLength || 0) * 60,
    rating: s.rating
  }));
}

/**
 * Отмечает сэмплы как использованные для обучения
 * @param {Array} sessionIds - Массив ID сессий
 */
async function markAsUsedForTraining(sessionIds) {
  await Session.updateMany(
    { _id: { $in: sessionIds } },
    { usedForTraining: true }
  );
}

/**
 * Получает статистику ML
 */
async function getMLStats() {
  const total = await Session.countDocuments({ userChoice: { $ne: null } });
  const newSamples = await Session.countDocuments({ 
    userChoice: { $ne: null }, 
    usedForTraining: false 
  });
  
  // Распределение по классам
  const distribution = await Session.aggregate([
    { $match: { userChoice: { $ne: null } } },
    { $group: { _id: '$userChoice', count: { $sum: 1 } } }
  ]);
  
  const classDistribution = {};
  distribution.forEach(d => {
    classDistribution[d._id] = d.count;
  });
  
  // Средний рейтинг
  const avgRating = await Session.aggregate([
    { $match: { rating: { $ne: null } } },
    { $group: { _id: null, avg: { $avg: '$rating' } } }
  ]);
  
  return {
    totalSessions: total,
    newSamples,
    classDistribution,
    avgRating: avgRating[0]?.avg || 0
  };
}

module.exports = {
  getRecommendation,
  saveSessionWithRecommendation,
  updateSessionWithChoice,
  getTrainingData,
  markAsUsedForTraining,
  getMLStats,
  getFallbackRecommendation
};