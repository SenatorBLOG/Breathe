// routes/posts.js
const express = require('express');
const router  = express.Router();
const Post    = require('../models/Post');
const Comment = require('../models/Comment');
const auth         = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const { body, validationResult } = require('express-validator');
const validator = require('validator');

// ─── Helper: safe user id ─────────────────────────────────────────────────────
function uid(req) {
  return req.user?._id ?? null;
}

// ─── Helper: format post for client ──────────────────────────────────────────
function formatPost(post, userId) {
  const obj = post.toObject ? post.toObject() : { ...post };
  obj.likeCount  = (obj.likes || []).length;
  obj.likedByMe  = userId
    ? (obj.likes || []).some(id => id.toString() === userId.toString())
    : false;
  obj.likes = undefined;
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
      .populate('author', 'username name email');

    const postIds     = posts.map(p => p._id);
    const commentAggs = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } },
    ]);
    const commentMap = Object.fromEntries(commentAggs.map(a => [a._id.toString(), a.count]));

    const userId  = uid(req);
    const payload = posts.map(p => ({
      ...formatPost(p, userId),
      commentCount: commentMap[p._id.toString()] || 0,
    }));

    res.json({ posts: payload, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error('GET /posts error:', err.message);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// ─── POST /api/posts — create (auth required) ────────────────────────────────
router.post('/', auth, [
  body('text')
    .trim()
    .isLength({ min: 1, max: 600 })
    .withMessage('Post text must be 1–600 characters'),
  body('category')
    .optional()
    .isIn(['experience', 'question', 'achievement', 'tip'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Max 5 tags'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const authorId = uid(req);
    if (!authorId) {
      return res.status(401).json({ error: 'Could not identify user' });
    }

    const { text, category, tags, sessionRef } = req.body;

    const cleanTags = Array.isArray(tags)
      ? tags.map(t => t.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()).filter(Boolean).slice(0, 5)
      : [];

    const post = await Post.create({
      author:     authorId,
      text:       validator.escape(text.trim()),
      category:   category || 'experience',
      tags:       cleanTags,
      sessionRef: sessionRef || null,
    });

    await post.populate('author', 'username name email');
    res.status(201).json(formatPost(post, authorId));
  } catch (err) {
    console.error('POST /posts error:', err.message);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// ─── GET /api/posts/:id — single post, public ────────────────────────────────
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username name email');
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const commentCount = await Comment.countDocuments({ post: post._id });
    const userId = uid(req);
    res.json({ ...formatPost(post, userId), commentCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// ─── GET /api/posts/:id/related — up to 3 posts sharing tags ─────────────────
router.get('/:id/related', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('tags category');
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const filter = {
      _id: { $ne: post._id },
      $or: [
        { tags: { $in: post.tags } },
        { category: post.category },
      ],
    };

    const related = await Post.find(filter)
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('author', 'username name email');

    const userId = uid(req);
    res.json(related.map(p => formatPost(p, userId)));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch related posts' });
  }
});

// ─── DELETE /api/posts/:id ────────────────────────────────────────────────────
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

// ─── POST /api/posts/:id/like ─────────────────────────────────────────────────
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userId = uid(req).toString();
    const idx    = post.likes.findIndex(id => id.toString() === userId);
    if (idx === -1) post.likes.push(uid(req));
    else            post.likes.splice(idx, 1);

    await post.save();
    res.json({ likeCount: post.likes.length, likedByMe: idx === -1 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// ─── POST /api/posts/:id/report ──────────────────────────────────────────────
router.post('/:id/report', auth, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { reported: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to report' });
  }
});

// ─── GET /api/posts/:id/comments — public ────────────────────────────────────
router.get('/:id/comments', optionalAuth, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: 1 })
      .populate('author', 'username name email');

    const userId  = uid(req);
    const payload = comments.map(c => {
      const obj     = c.toObject();
      obj.likeCount = obj.likes.length;
      obj.likedByMe = userId
        ? obj.likes.some(id => id.toString() === userId.toString())
        : false;
      obj.likes = undefined;
      return obj;
    });

    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// ─── POST /api/posts/:id/comments ────────────────────────────────────────────
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) return res.status(400).json({ error: 'Text required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = await Comment.create({
      post:   req.params.id,
      author: uid(req),
      text:   text.trim(),
    });
    await comment.populate('author', 'username name email');

    const obj     = comment.toObject();
    obj.likeCount = 0;
    obj.likedByMe = false;
    obj.likes     = undefined;
    res.status(201).json(obj);
  } catch (err) {
    console.error('POST comment error:', err.message);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// ─── POST /api/posts/:id/report ──────────────────────────────────────────────
router.post('/:id/report', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const reason = String(req.body.reason || '').trim().slice(0, 500);
    post.reports = post.reports || [];
    post.reports.push({ userId: uid(req), reason, createdAt: new Date() });
    await post.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('POST report error:', err.message);
    res.status(500).json({ error: 'Failed to submit report' });
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

    const userId = uid(req).toString();
    const idx    = comment.likes.findIndex(id => id.toString() === userId);
    if (idx === -1) comment.likes.push(uid(req));
    else            comment.likes.splice(idx, 1);

    await comment.save();
    res.json({ likeCount: comment.likes.length, likedByMe: idx === -1 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle comment like' });
  }
});

module.exports = router;