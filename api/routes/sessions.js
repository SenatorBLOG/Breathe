// routes/sessions.js
const express  = require('express');
const router   = express.Router();
const Session  = require('../models/Session');
const authenticate = require('../middleware/auth');

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
    res.status(500).json({ error: err.message });
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
    res.status(201).json(session);
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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

module.exports = router;