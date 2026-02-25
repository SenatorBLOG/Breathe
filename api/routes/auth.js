//server/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// POST /api/auth/register - reg
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({ email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'User registered', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login - login
router.post('/login', async (req, res) => {
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

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google Auth
router.post('/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'No Google credential provided' });
  }

  try {
    console.log('Получен credential от фронта, длина:', credential.length);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google token payload');
    }

    const { email, name, picture, sub: googleId } = payload;

    console.log('Google payload:', { email, name, googleId });

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        name,
        picture,
        googleId,
      });
      await user.save();
      console.log('Создан новый юзер по Google:', user.email);
    } else {
      console.log('Юзер найден по email:', user.email);
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, message: 'Signed in with Google' });
  } catch (err) {
    console.error('Google auth error:', err.message || err);
    res.status(401).json({ error: 'Google authentication failed: ' + (err.message || 'Unknown error') });
  }
});

module.exports = router;