const express        = require('express');
const router         = express.Router();
const User           = require('../models/User');
const Session        = require('../models/Session');
const Post           = require('../models/Post');
const Comment        = require('../models/Comment');
const GlobePin       = require('../models/GlobePin');
const UserChallenge  = require('../models/UserChallenge');
const auth           = require('../middleware/auth');

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

// ─── GET /api/users/me/export — GDPR data portability (Art. 20) ──────────────
router.get('/me/export', auth, async (req, res) => {
  try {
    const uid = req.user._id;
    const [user, sessions, posts, comments, pins, challenges] = await Promise.all([
      User.findById(uid).select('-password -__v').lean(),
      Session.find({ userId: uid }).select('-__v').lean(),
      Post.find({ author: uid }).select('-__v').lean(),
      Comment.find({ author: uid }).select('-__v').lean(),
      GlobePin.find({ userId: uid }).select('-__v').lean(),
      UserChallenge.find({ userId: uid }).select('-__v').lean(),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      account: user,
      breathingSessions: sessions,
      communityPosts: posts,
      communityComments: comments,
      globePins: pins,
      challenges,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="breathe-my-data.json"');
    res.json(payload);
  } catch (err) {
    console.error('GET /users/me/export error:', err.message);
    res.status(500).json({ error: 'Failed to export data.' });
  }
});

// ─── DELETE /api/users/me — GDPR right to erasure (Art. 17) ──────────────────
// Hard-delete the user's PII along with every record that ties to them. Posts
// and Comments have `author: required: true` in their schemas, so we can't
// soft-anonymise — we hard-delete. The user's comments on OTHER posts are
// also deleted (they contain user-authored text, which is PII under GDPR).
router.delete('/me', auth, async (req, res) => {
  try {
    const uid = req.user._id;
    // Collect post IDs first so we can cascade-delete all comments on them
    const userPosts = await Post.find({ author: uid }).select('_id').lean();
    const userPostIds = userPosts.map(p => p._id);

    await Promise.all([
      Session.deleteMany({ userId: uid }),
      GlobePin.deleteMany({ userId: uid }),
      UserChallenge.deleteMany({ userId: uid }),
      Comment.deleteMany({ author: uid }),                  // their comments
      Comment.deleteMany({ post: { $in: userPostIds } }),   // comments on their posts
      Post.deleteMany({ author: uid }),
    ]);
    await User.findByIdAndDelete(uid);
    res.json({ ok: true, message: 'Account and associated data deleted.' });
  } catch (err) {
    console.error('DELETE /users/me error:', err.message);
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

module.exports = router;
