const express = require('express');
const router  = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit     = require('express-rate-limit');
const GlobePin      = require('../models/GlobePin');
const auth          = require('../middleware/auth');
const optionalAuth  = require('../middleware/optionalAuth');

// ── Rate limits ───────────────────────────────────────────────────────────────
const getLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const likeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// ── GET /globe/pins ───────────────────────────────────────────────────────────
router.get('/', getLimiter, optionalAuth, async (req, res) => {
  try {
    const { country, technique, bbox } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 200, 500);

    const filter = {};

    if (country) {
      filter.country = { $regex: new RegExp(country.trim(), 'i') };
    }
    if (technique && technique !== 'all') {
      filter.technique = technique;
    }
    if (bbox) {
      const parts = String(bbox).split(',').map(Number);
      if (parts.length === 4 && parts.every(n => !isNaN(n))) {
        const [lat1, lng1, lat2, lng2] = parts;
        filter.lat = { $gte: Math.min(lat1, lat2), $lte: Math.max(lat1, lat2) };
        filter.lng = { $gte: Math.min(lng1, lng2), $lte: Math.max(lng1, lng2) };
      }
    }

    const pins = await GlobePin.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(pins);
  } catch (err) {
    console.error('GET /globe/pins error:', err);
    res.status(500).json({ error: 'Failed to fetch pins.' });
  }
});

// ── GET /globe/stats ──────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalPins, distinctCountries, topCities, techniqueAgg] = await Promise.all([
      GlobePin.countDocuments(),
      GlobePin.distinct('country').then(arr => arr.filter(Boolean).length),
      GlobePin.aggregate([
        { $match: { city: { $ne: '' } } },
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      GlobePin.aggregate([
        { $group: { _id: '$technique', count: { $sum: 1 } } },
      ]),
    ]);

    const techniqueBreakdown = {};
    for (const entry of techniqueAgg) {
      techniqueBreakdown[entry._id] = entry.count;
    }

    res.json({
      totalPins,
      countries: distinctCountries,
      topCities,
      techniqueBreakdown,
    });
  } catch (err) {
    console.error('GET /globe/stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// ── POST /globe/pins ──────────────────────────────────────────────────────────
const postValidation = [
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('lat must be between -90 and 90'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('lng must be between -180 and 180'),
  body('city').optional().isString().trim().escape().isLength({ max: 100 }),
  body('country').optional().isString().trim().escape().isLength({ max: 100 }),
  body('title').optional().isString().trim().escape().isLength({ max: 80 }),
  body('note').optional().isString().trim().escape().isLength({ max: 300 }),
  body('sessionLink').optional().isString().trim().isLength({ max: 500 }),
  body('photoUrl').optional().isString().isLength({ max: 1500000 }),
  body('technique').optional().isIn(['box', '4-7-8', 'wim-hof', 'coherent', 'belly', 'alternate', 'other']),
];

router.post('/', auth, postValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lat, lng, city, country, title, note, technique, sessionLink, photoUrl } = req.body;

    // Derive username from user document — fallback to email prefix
    let username = 'Anonymous';
    try {
      const User = require('../models/User');
      const userDoc = await User.findById(req.user._id).select('name email').lean();
      if (userDoc) {
        username = userDoc.name || userDoc.email?.split('@')[0] || 'Anonymous';
      }
    } catch {
      // User model may not expose name — keep Anonymous
    }

    const pin = await GlobePin.create({
      userId:    req.user._id,
      username,
      lat,
      lng,
      city:        city        || '',
      country:     country     || '',
      title:       title       || 'Meditation spot',
      note:        note        || '',
      technique:   technique   || 'other',
      sessionLink: sessionLink || '',
      photoUrl:    photoUrl    || '',
    });

    res.status(201).json(pin);
  } catch (err) {
    console.error('POST /globe/pins error:', err);
    res.status(500).json({ error: 'Failed to create pin.' });
  }
});

// ── DELETE /globe/pins/:id ────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const pin = await GlobePin.findById(req.params.id);
    if (!pin) {
      return res.status(404).json({ error: 'Pin not found.' });
    }
    if (String(pin.userId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to delete this pin.' });
    }
    await pin.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /globe/pins/:id error:', err);
    res.status(500).json({ error: 'Failed to delete pin.' });
  }
});

// ── POST /globe/pins/:id/like ─────────────────────────────────────────────────
router.post('/:id/like', likeLimiter, optionalAuth, async (req, res) => {
  try {
    const pin = await GlobePin.findByIdAndUpdate(
      req.params.id,
      { $inc: { likeCount: 1 } },
      { new: true }
    );
    if (!pin) {
      return res.status(404).json({ error: 'Pin not found.' });
    }
    res.json({ likeCount: pin.likeCount });
  } catch (err) {
    console.error('POST /globe/pins/:id/like error:', err);
    res.status(500).json({ error: 'Failed to like pin.' });
  }
});

module.exports = router;
