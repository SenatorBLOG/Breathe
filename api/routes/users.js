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

module.exports = router;
