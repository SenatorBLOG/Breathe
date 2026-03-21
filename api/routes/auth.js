const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const authenticate = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET;
const { sendWelcome } = require('../services/emailService');

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('name')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage('Name too long'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({ email, password, name });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'User registered', token, user: { id: user._id, email: user.email, name: user.name } });

    // Send welcome email — fire-and-forget, never fails registration
    sendWelcome(user.email, user.name).catch(err =>
      console.error('Welcome email failed:', err.message)
    );
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ─── POST /api/auth/google ────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: 'No Google access token provided' });
  }

  try {
    const userInfoRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
    if (!userInfoRes.ok) {
      return res.status(401).json({ error: 'Invalid Google access token' });
    }
    const payload = await userInfoRes.json();

    if (!payload.email) {
      return res.status(400).json({ error: 'Google account has no email' });
    }

    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name, picture, googleId, authType: 'google' });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, picture: user.picture } });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('GET /me error:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ─── PATCH /api/auth/me ───────────────────────────────────────────────────────
router.patch('/me', authenticate, async (req, res) => {
  try {
    const { nickname, avatar, bodyProfile } = req.body;
    const updates = {};
    if (nickname   !== undefined) updates.nickname    = String(nickname).trim().slice(0, 30);
    if (avatar     !== undefined) updates.avatar      = avatar;
    if (bodyProfile !== undefined) updates.bodyProfile = bodyProfile;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, select: '-password', runValidators: true }
    ).lean();
    res.json(user);
  } catch (err) {
    console.error('PATCH /me error:', err.message);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
