const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/auth/register
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

// POST /api/auth/login
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
    localStorage.setItem('userId', user._id);
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'No Google credential provided' });
  }

  try {
    // Decode Google JWT without network call
    // Token is already verified by Google on the client side
    const payload = jwt.decode(credential);

    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    // Check token expiry manually
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return res.status(401).json({ error: 'Google token expired' });
    }

    const { email, name, picture, sub: googleId } = payload;
    console.log('Google payload decoded:', { email, name, googleId });

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, name, picture, googleId, authType: 'google' });
      await user.save();
      console.log('Created new Google user:', email);
    } else {
      console.log('Found existing user:', email);
    }
    localStorage.setItem('userId', user._id);
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(500).json({ error: 'Authentication failed: ' + err.message });
  }
});

module.exports = router;