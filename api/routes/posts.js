// routes/posts.js
const express = require('express');
const router  = express.Router();
const Post    = require('../models/Post');
const Comment = require('../models/Comment');
const auth         = require('../middleware/auth'); // your existing JWT middleware
const optionalAuth = require('../middleware/optionalAuth');

// ─── Helper: get user id regardless of middleware format ─────────────────────
// Old middleware sets req.user = JWT payload { userId }
// New middleware sets req.user = Mongoose doc { _id }
function uid(req) {
  if (!req.user) return null;
  return req.user._id ?? req.user.userId ?? req.user.id ?? null;
}

// ─── Helper: attach like/comment counts + viewer's like status ───────────────
function formatPost(post, userId) {
  const obj = post.toObject ? post.toObject() : { ...post };
  obj.likeCount    = (obj.likes || []).length;
  obj.likedByMe    = userId ? (obj.likes || []).some(id => id.toString() === userId.toString()) : false;
  obj.likes        = undefined; // don't send full array to client
  return obj;
}

// ─── GET /api/posts — public feed ────────────────────────────────────────────
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, tag, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (tag) filter.tags = tag;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('author', 'username name');

    // get comment counts in one query
    const postIds     = posts.map(p => p._id);
    const commentAggs = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } },
    ]);
    const commentMap  = Object.fromEntries(commentAggs.map(a => [a._id.toString(), a.count]));

    const userId  = uid(req); // may be undefined for unauthenticated
    const payload = posts.map(p => ({
      ...formatPost(p, userId),
      commentCount: commentMap[p._id.toString()] || 0,
    }));

    res.json({ posts: payload, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// ─── POST /api/posts — create (auth required) ─────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { text, category, tags, sessionRef } = req.body;
    if (!text || text.trim().length === 0) return res.status(400).json({ error: 'Text is required' });

    // sanitize tags
    const cleanTags = Array.isArray(tags)
      ? tags.map(t => t.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()).filter(Boolean).slice(0, 5)
      : [];

    const post = await Post.create({
      author: uid(req),
      text: text.trim(),
      category: category || 'experience',
      tags: cleanTags,
      sessionRef: sessionRef || null,
    });

    await post.populate('author', 'username name email');

    // formatPost is safe even if populate fields are missing
    const formatted = formatPost(post, uid(req));
    // Ensure author always has a displayable name
    if (formatted.author && !formatted.author.name && !formatted.author.username) {
      formatted.author.username = formatted.author.email?.split('@')[0] ?? 'User';
    }
    res.status(201).json(formatted);
  } catch (err) {
    console.error('POST /posts error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to create post', detail: err.message });
  }
});

// ─── DELETE /api/posts/:id — delete own post (auth required) ─────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author.toString() !== uid(req).toString())
      return res.status(403).json({ error: 'Not your post' });

    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ post: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ─── POST /api/posts/:id/like — toggle like (auth required) ──────────────────
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post   = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userIdStr = uid(req).toString();
    const idx    = post.likes.findIndex(id => id.toString() === userIdStr);
    if (idx === -1) post.likes.push(uid(req));
    else            post.likes.splice(idx, 1);

    await post.save();
    res.json({ likeCount: post.likes.length, likedByMe: idx === -1 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// ─── POST /api/posts/:id/report — report post (auth required) ────────────────
router.post('/:id/report', auth, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { reported: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to report' });
  }
});

// ════════════════════════════════════════════════════════
//  COMMENTS
// ════════════════════════════════════════════════════════

// ─── GET /api/posts/:id/comments — public ────────────────────────────────────
router.get('/:id/comments', optionalAuth, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: 1 })
      .populate('author', 'username name');

    const userId  = uid(req);
    const payload = comments.map(c => {
      const obj       = c.toObject();
      obj.likeCount   = obj.likes.length;
      obj.likedByMe   = userId ? obj.likes.some(id => id.toString() === userId?.toString()) : false;
      obj.likes       = undefined;
      return obj;
    });

    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// ─── POST /api/posts/:id/comments — create (auth required) ───────────────────
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) return res.status(400).json({ error: 'Text required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = await Comment.create({ post: req.params.id, author: uid(req), text: text.trim() });
    await comment.populate('author', 'username name');

    const obj       = comment.toObject();
    obj.likeCount   = 0;
    obj.likedByMe   = false;
    obj.likes       = undefined;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// ─── DELETE /api/posts/:postId/comments/:commentId ───────────────────────────
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.author.toString() !== uid(req).toString())
      return res.status(403).json({ error: 'Not your comment' });

    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// ─── POST /api/posts/:postId/comments/:commentId/like ────────────────────────
router.post('/:postId/comments/:commentId/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const userIdStr2 = uid(req).toString();
    const idx = comment.likes.findIndex(id => id.toString() === userIdStr2);
    if (idx === -1) comment.likes.push(uid(req));
    else            comment.likes.splice(idx, 1);

    await comment.save();
    res.json({ likeCount: comment.likes.length, likedByMe: idx === -1 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle comment like' });
  }
});

module.exports = router;