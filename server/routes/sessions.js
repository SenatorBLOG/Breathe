//server/routes/sessions.js
const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const authenticate = require('../middleware/auth');

// GET /api/sessions — fetch all sessions(only for auth user)
router.get('/', authenticate, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId }).sort({ sessionDate: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/sessions — delete all sessions (only for auth user)
router.delete('/', authenticate, async (req, res) => {
  try {
    await Session.deleteMany({ userId: req.userId });
    res.status(200).json({ message: 'All sessions deleted successfully' });
  } catch (err) {
    console.error('Error deleting sessions:', err);
    res.status(500).json({ message: 'Failed to delete sessions', error: err });
  }
});

// POST /api/sessions — create new session (only for auth user)
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      sessionDate,
      moodBefore,
      moodAfter,
      focusLevel,
      stressLevel,
      breathingDepth,
      calmnessScore,
      distractionCount,
      timeOfDay,
      noiseLevel,
      sessionLength,
      cycles,
      notes
    } = req.body;

    const session = new Session({
      sessionDate: sessionDate ? new Date(sessionDate) : new Date(),
      moodBefore,
      moodAfter,
      focusLevel,
      stressLevel,
      breathingDepth,
      calmnessScore,
      distractionCount,
      timeOfDay,
      noiseLevel,
      sessionLength,
      cycles,
      notes,
      userId: req.userId // attach to user
    });

    await session.save();
    console.log('✅ Saved session to DB:', session);
    res.status(201).json(session);
  } catch (err) {
    console.error('❌ Failed to save session:', err);
    res.status(400).json({ error: err.message });
  }
});

// --- DEBUG endpoint, local ---
if (process.env.NODE_ENV === 'development') {
  router.get('/debug', async (req, res) => {
    try {
      const sessions = await Session.find().lean(); // all sessions
      res.json(sessions);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
}
// for local
if (process.env.NODE_ENV === 'development') {
  router.delete('/debug/delete', async (req, res) => {
    try {
      await Session.deleteMany({});
      res.json({ msg: "✅ All sessions deleted (debug)" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
}
module.exports = router;