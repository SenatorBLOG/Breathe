// routes/leaderboard.js
const express     = require('express');
const router      = express.Router();
const Session     = require('../models/Session');
const User        = require('../models/User');
const authenticate = require('../middleware/auth');

function calcStreak(dateStrings) {
  if (!dateStrings.length) return 0;
  const today = new Date().toDateString();
  if (!dateStrings.includes(today)) return 0;
  let streak = 1;
  const cur = new Date();
  cur.setDate(cur.getDate() - 1);
  while (dateStrings.includes(cur.toDateString())) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

function displayName(u) {
  return u?.nickname || u?.name || 'Anonymous';
}

// GET /api/leaderboard?type=time|streak|weekly  (auth optional — show own rank)
router.get('/', authenticate, async (req, res) => {
  try {
    const { type = 'time', limit = 50 } = req.query;
    const TOP = Math.min(Number(limit), 100);

    if (type === 'time' || type === 'weekly') {
      const matchStage = type === 'weekly'
        ? { $match: { sessionDate: { $gte: new Date(Date.now() - 7 * 86400000) } } }
        : { $match: {} };

      const results = await Session.aggregate([
        matchStage,
        { $group: { _id: '$userId', totalMins: { $sum: '$sessionLength' }, sessions: { $sum: 1 } } },
        { $sort: { totalMins: -1 } },
        { $limit: TOP },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $project: {
            totalMins: 1,
            sessions: 1,
            displayName: { $ifNull: ['$user.nickname', { $ifNull: ['$user.name', 'Anonymous'] }] },
            avatar: '$user.avatar',
            picture: '$user.picture',
          }
        },
      ]);

      return res.json(results.map((r, i) => ({ rank: i + 1, ...r })));
    }

    if (type === 'streak') {
      // Load all sessions, compute streak per user, rank
      const allSessions = await Session.find({}, 'userId sessionDate').lean();

      const byUser = new Map();
      allSessions.forEach(s => {
        const key = s.userId.toString();
        if (!byUser.has(key)) byUser.set(key, new Set());
        byUser.get(key).add(new Date(s.sessionDate).toDateString());
      });

      const streaks = [];
      byUser.forEach((dates, userId) => {
        const streak = calcStreak([...dates]);
        if (streak > 0) streaks.push({ userId, streak });
      });

      streaks.sort((a, b) => b.streak - a.streak);
      const top = streaks.slice(0, TOP);

      const userIds = top.map(s => s.userId);
      const users   = await User.find({ _id: { $in: userIds } })
        .select('nickname name avatar picture').lean();
      const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

      return res.json(top.map((s, i) => ({
        rank: i + 1,
        _id: s.userId,
        streak: s.streak,
        displayName: displayName(userMap[s.userId] ?? {}),
        avatar: userMap[s.userId]?.avatar ?? userMap[s.userId]?.picture ?? null,
      })));
    }

    res.status(400).json({ error: 'Invalid type. Use: time | weekly | streak' });
  } catch (err) {
    console.error('Leaderboard error:', err.message);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

module.exports = router;
