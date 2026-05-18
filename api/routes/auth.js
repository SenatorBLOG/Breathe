const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authenticate = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

// Pre-generated cost-12 bcrypt hash of a throwaway string. Used to keep the
// "user not found" branch's response timing equal to the "password wrong"
// branch — without this, the no-such-email branch returns in ~3 ms while the
// real branch takes ~200 ms, leaking email existence over the network.
// The plaintext is irrelevant; the hash just gives bcrypt.compare a real
// workload of the same cost.
const TIMING_DUMMY_HASH = '$2b$12$1.QmSl/egSQX95ZvPZc2tuygEbzk2hBZCTSCDyrH3bPqbQiSK5bYW';

// Per-IP throttles. The global limiter in server.js is too loose (100/15min)
// for auth flows — credential stuffing and email enumeration need much
// tighter caps. `keyGenerator` falls back to `req.ip` honoring trust proxy.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,                       // 8 attempts per 15 min per IP
  message: { error: 'Too many login attempts. Please wait a few minutes and try again.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 6,                       // 6 signups per hour per IP — blocks automated enumeration
  message: { error: 'Too many signup attempts. Please try again later.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// Single generic message for all auth failures so an attacker cannot tell
// whether the email exists, the password was wrong, or the input was
// invalid (mitigates OWASP API3 / user enumeration).
const GENERIC_AUTH_ERR = 'Invalid email or password';

const JWT_SECRET = process.env.JWT_SECRET;
const { sendWelcome } = require('../services/emailService');

const GOOGLE_CLIENT_ID = '617412317511-19s97rms2r9t3ihl041h7k128a7pqd98.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', registerLimiter, [
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
      // Don't confirm/deny the existence of the email to the client. We
      // return a 200 with no token and trigger a side-channel email to the
      // legitimate owner so they know a signup was attempted. The attacker
      // sees the same response as a fresh successful signup.
      sendWelcome(email, '').catch(err =>
        console.error('Existing-user notification failed:', err.message)
      );
      return res.status(200).json({ message: 'If this email is new, check your inbox to finish signing up.' });
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
router.post('/login', loginLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: GENERIC_AUTH_ERR });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Run a REAL bcrypt compare against a valid pre-computed hash so this
      // branch takes the same time (~200 ms at cost 12) as the wrong-password
      // branch. The previous version called `comparePassword` with an
      // invalid hash, which threw immediately and left timing leakable.
      await bcrypt.compare(password, TIMING_DUMMY_HASH);
      return res.status(400).json({ error: GENERIC_AUTH_ERR });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: GENERIC_AUTH_ERR });
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
  const { idToken, access_token } = req.body;

  try {
    let payload;

    if (idToken) {
      // Android / native — verify signed ID token
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else if (access_token) {
      // Web — exchange access token for user info
      const userInfoRes = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
      );
      if (!userInfoRes.ok) {
        return res.status(401).json({ error: 'Invalid Google access token' });
      }
      payload = await userInfoRes.json();
    } else {
      return res.status(400).json({ error: 'No token provided' });
    }

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
    const { nickname, avatar, bodyProfile, emailPreferences } = req.body;
    const updates = {};
    if (nickname          !== undefined) updates.nickname    = String(nickname).trim().slice(0, 30);
    if (avatar            !== undefined) updates.avatar      = avatar;
    if (bodyProfile       !== undefined) updates.bodyProfile = bodyProfile;
    if (emailPreferences  !== undefined) {
      if (typeof emailPreferences.reminder === 'boolean')
        updates['emailPreferences.reminder'] = emailPreferences.reminder;
      if (typeof emailPreferences.reminderHour === 'number')
        updates['emailPreferences.reminderHour'] = Math.max(0, Math.min(23, Math.floor(emailPreferences.reminderHour)));
      if (typeof emailPreferences.weekly === 'boolean')
        updates['emailPreferences.weekly'] = emailPreferences.weekly;
    }

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
