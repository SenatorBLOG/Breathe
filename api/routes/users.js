const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const auth    = require('../middleware/auth');

// ─── POST /api/users/:id/block ────────────────────────────────────────────────
router.post('/:id/block', auth, async (req, res) => {
  try {
    const targetId = req.params.id;
    const myId     = req.user._id;

    if (targetId === String(myId)) {
      return res.status(400).json({ error: "You can't block yourself." });
    }

    const target = await User.findById(targetId).select('_id').lean();
    if (!target) return res.status(404).json({ error: 'User not found.' });

    await User.updateOne(
      { _id: myId },
      { $addToSet: { blockedUsers: targetId } }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('POST /users/:id/block error:', err.message);
    res.status(500).json({ error: 'Failed to block user.' });
  }
});

// ─── DELETE /api/users/:id/block — unblock ───────────────────────────────────
router.delete('/:id/block', auth, async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id },
      { $pull: { blockedUsers: req.params.id } }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /users/:id/block error:', err.message);
    res.status(500).json({ error: 'Failed to unblock user.' });
  }
});

// ─── GET /api/users/me — get current user profile ─────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error('GET /users/me error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// ─── PATCH /api/users/me — update user profile (including theme) ──────────────
router.patch('/me', auth, async (req, res) => {
  try {
    const allowedUpdates = ['nickname', 'avatar', 'bodyProfile', 'emailPreferences', 'theme'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Validate theme value
    if (updates.theme && !['night', 'day', 'nature'].includes(updates.theme)) {
      return res.status(400).json({ error: 'Invalid theme value. Must be: night, day, or nature.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error('PATCH /users/me error:', err.message);
    res.status(500).json({ error: 'Failed to update user profile.' });
  }
});

module.exports = router;
