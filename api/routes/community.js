// routes/community.js
const express = require('express');
const router  = express.Router();
const Post    = require('../models/Post');
const User    = require('../models/User');

// Simple in-memory cache: { data, expiresAt }
let statsCache   = null;
let sidebarCache = null;

// ─── GET /api/community/stats ─────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const now = Date.now();
    if (statsCache && statsCache.expiresAt > now) {
      return res.json(statsCache.data);
    }

    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [members, posts, activeAuthors] = await Promise.all([
      User.countDocuments({}),
      Post.countDocuments({}),
      Post.distinct('author', { createdAt: { $gte: oneWeekAgo } }),
    ]);

    const data = { members, posts, activeThisWeek: activeAuthors.length };
    statsCache = { data, expiresAt: now + 60 * 60 * 1000 }; // 1 hour TTL
    res.json(data);
  } catch (err) {
    console.error('GET /community/stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─── GET /api/community/sidebar ───────────────────────────────────────────────
router.get('/sidebar', async (req, res) => {
  try {
    const now = Date.now();
    if (sidebarCache && sidebarCache.expiresAt > now) {
      return res.json(sidebarCache.data);
    }

    const oneWeekAgo  = new Date(now - 7  * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Top tags by frequency in last 30 days
    const tagAgg = await Post.aggregate([
      { $match: { createdAt: { $gte: oneMonthAgo }, tags: { $exists: true, $ne: [] } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const topTags = tagAgg.map(t => t._id);

    // Top users by post count in last 7 days
    const userAgg = await Post.aggregate([
      { $match: { createdAt: { $gte: oneWeekAgo } } },
      { $group: { _id: '$author', postCount: { $sum: 1 } } },
      { $sort: { postCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 1, postCount: 1, name: '$user.name', username: '$user.username' } },
    ]);
    const topUsers = userAgg.map(u => ({
      _id: u._id,
      name: u.name || u.username || 'User',
      postCount: u.postCount,
    }));

    // Popular posts: top 3 by likes in last 7 days
    const recentPosts = await Post.find({ createdAt: { $gte: oneWeekAgo } })
      .select('_id text tags likes')
      .lean();

    const popularPosts = recentPosts
      .map(p => ({ _id: p._id, text: p.text, tags: p.tags, likeCount: (p.likes || []).length }))
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 3);

    const data = { topTags, topUsers, popularPosts };
    sidebarCache = { data, expiresAt: now + 30 * 60 * 1000 }; // 30 min TTL
    res.json(data);
  } catch (err) {
    console.error('GET /community/sidebar error:', err.message);
    res.status(500).json({ error: 'Failed to fetch sidebar data' });
  }
});

module.exports = router;
