// routes/sessions.js
const express  = require('express');
const router   = express.Router();
const Session  = require('../models/Session');
const User     = require('../models/User');
const authenticate = require('../middleware/auth');
const mlService = require('../services/mlService');
const { checkAchievements } = require('../services/achievementService');

// ─── Helper — works with both old (req.userId) and new (req.user._id) middleware
function getUserId(req) {
  return req.user?._id ?? req.user?.userId ?? req.userId ?? null;
}

// GET /api/sessions
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = getUserId(req);
    const sessions = await Session.find({ userId }).sort({ sessionDate: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/sessions
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'User not identified' });

    const {
      sessionDate, moodBefore, moodAfter, focusLevel, stressLevel,
      breathingDepth, calmnessScore, distractionCount, timeOfDay,
      noiseLevel, sessionLength, cycles, notes,
    } = req.body;

    const session = new Session({
      userId,
      sessionDate:      sessionDate ? new Date(sessionDate) : new Date(),
      moodBefore,       moodAfter,
      focusLevel,       stressLevel,
      breathingDepth,   calmnessScore,
      distractionCount, timeOfDay,
      noiseLevel,       sessionLength,
      cycles,           notes,
    });

    await session.save();
    console.log('✅ Saved session:', session._id, 'for user:', userId);

    // Check achievements (fire-and-forget, returns unlocked list to client)
    const newAchievements = await checkAchievements(userId, session).catch(() => []);

    // Update lastSessionAt and reset reminder flag (fire-and-forget)
    User.updateOne(
      { _id: userId },
      { $set: { lastSessionAt: new Date(), reminderEmailSent: null } }
    ).catch(err => console.error('Failed to update lastSessionAt:', err.message));

    // Auto-checkin for active challenges (fire-and-forget)
    ;(async () => {
      try {
        const UserChallenge = require('../models/UserChallenge');
        const Challenge     = require('../models/Challenge');
        const uc = await UserChallenge.findOne({
          userId, completedAt: null, abandoned: false,
        }).populate('challengeId');
        if (!uc) return;
        const challenge = uc.challengeId;
        if (!challenge || session.sessionLength < challenge.minMinutes) return;
        const today = new Date().toDateString();
        const alreadyDone = uc.completedDays.some(d => new Date(d).toDateString() === today);
        if (alreadyDone) return;
        uc.completedDays.push(new Date());
        if (uc.completedDays.length >= challenge.duration) {
          uc.completedAt = new Date();
          uc.badge = { ...challenge.badge, earnedAt: new Date() };
        }
        await uc.save();
        console.log(`✅ Auto-checkin: user ${userId} day ${uc.completedDays.length}/${challenge.duration} on "${challenge.title}"`);
      } catch (err) {
        console.error('Auto-checkin error:', err.message);
      }
    })();

    res.status(201).json({ ...session.toObject(), newAchievements });
  } catch (err) {
    console.error('❌ Failed to save session:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/sessions — delete all for user
router.delete('/', authenticate, async (req, res) => {
  try {
    const userId = getUserId(req);
    await Session.deleteMany({ userId });
    res.json({ message: 'All sessions deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/sessions/:id — delete one
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId  = getUserId(req);
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.userId.toString() !== userId.toString())
      return res.status(403).json({ error: 'Not your session' });

    await Session.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Debug routes (dev only)
if (process.env.NODE_ENV === 'development') {
  router.get('/debug', async (req, res) => {
    const sessions = await Session.find().lean();
    res.json(sessions);
  });
  router.delete('/debug/delete', async (req, res) => {
    await Session.deleteMany({});
    res.json({ msg: '✅ All sessions deleted (debug)' });
  });
}

// ─── ML Recommendation Routes ───

// GET /api/sessions/recommendation - получить рекомендацию от ML
router.get('/recommendation', authenticate, async (req, res) => {
  try {
    const { text, stressLevel, timeOfDay } = req.query;    
    const recommendation = await mlService.getRecommendation({
      text: text || '',
      stressLevel: stressLevel ? parseFloat(stressLevel) : 5,
      timeOfDay: timeOfDay || 'evening'
    });
    
    res.json(recommendation);
  } catch (err) {
    console.error('ML recommendation error:', err.message);
    res.status(500).json({ error: 'Failed to get recommendation' });
  }
});

// POST /api/sessions/with-recommendation - создать сессию с ML-рекомендацией
router.post('/with-recommendation', authenticate, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'User not identified' });
    
    const { text, stressLevel, timeOfDay, duration, notes } = req.body;
    
    const result = await mlService.saveSessionWithRecommendation({
      userId,
      text,
      stressLevel,
      timeOfDay,
      duration,
      notes
    });
    
    res.status(201).json(result);
  } catch (err) {
    console.error('Failed to create session with recommendation:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/sessions/:id/choice - обновить выбор пользователя после сессии
router.patch('/:id/choice', authenticate, async (req, res) => {
  try {
    const { userChoice, rating } = req.body;
    
    if (!userChoice || !['breathing', 'sleep', 'focus', 'relaxation'].includes(userChoice)) {
      return res.status(400).json({ error: 'Invalid userChoice' });
    }
    
    const session = await mlService.updateSessionWithChoice(
      req.params.id,
      userChoice,
      rating
    );
    
    res.json(session);
  } catch (err) {
    console.error('Failed to update session choice:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/sessions/ml-stats - статистика ML (admin only)
router.get('/ml-stats', authenticate, async (req, res) => {
  try {
    // TODO: добавить проверку admin прав
    const stats = await mlService.getMLStats();
    res.json(stats);
  } catch (err) {
    console.error('Failed to get ML stats:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;