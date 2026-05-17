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

    // Privacy: never return full address (`title` field may contain street-level
    // text) or `userId` (enables user enumeration) to unauthenticated clients.
    // Coordinates are rounded to 2 decimals (~1.1 km) so a pin can show "I
    // meditated in this neighbourhood" without leaking the exact home address.
    const pins = await GlobePin.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('lat lng city country technique note photoUrl likeCount createdAt username')
      .lean();

    const requesterId = req.user?._id?.toString();
    const publicPins = pins.map(p => {
      // The pin's owner sees their own pin at full precision; everyone else
      // sees a coarse coordinate so the location isn't a stalking vector.
      const isOwner = requesterId && p.userId && String(p.userId) === requesterId;
      if (isOwner) return p;
      return {
        ...p,
        lat: Math.round(p.lat * 100) / 100,
        lng: Math.round(p.lng * 100) / 100,
        // Strip the username down to a non-identifying initial so the email
        // prefix isn't published verbatim alongside city + country.
        username: typeof p.username === 'string' && p.username
          ? (p.username[0].toUpperCase() + (p.username.length > 1 ? '.' : ''))
          : 'Anonymous',
      };
    });

    res.json(publicPins);
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

// ── POST /globe/resolve-place — parse map URL via Google APIs ─────────────────
const resolveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many requests. Slow down.' },
});

router.post('/resolve-place', resolveLimiter, async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'URL required' });

  const KEY = process.env.GOOGLE_MAPS_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'Maps API not configured' });

  try {
    // 1. Resolve short links (goo.gl / maps.app.goo.gl)
    let resolved = url.trim();
    if (/goo\.gl|maps\.app\.goo\.gl/.test(resolved)) {
      const r = await fetch(resolved, { method: 'HEAD', redirect: 'follow' });
      resolved = r.url;
    }

    // 2. Extract signals from URL
    const coordsM  = resolved.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const nameM    = resolved.match(/maps\/place\/([^/@?&#]+)/);
    const placeIdM = resolved.match(/!1s(ChIJ[^!&]+)/);

    const lat     = coordsM  ? parseFloat(coordsM[1])  : null;
    const lng     = coordsM  ? parseFloat(coordsM[2])  : null;
    const rawName = nameM    ? decodeURIComponent(nameM[1].replace(/\+/g, ' ')) : null;
    const placeId = placeIdM ? decodeURIComponent(placeIdM[1]) : null;

    const getAddrComp = (comps, type, key = 'long_name') =>
      comps?.find(c => c.types?.includes(type))?.[key] ?? '';

    const fetchPhoto = async (photoName) => {
      try {
        const r = await fetch(`https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${KEY}`);
        if (!r.ok) return null;
        const buf = await r.arrayBuffer();
        const ct  = r.headers.get('content-type') || 'image/jpeg';
        return `data:${ct};base64,${Buffer.from(buf).toString('base64')}`;
      } catch { return null; }
    };

    let result = null;

    // A) Place ID → Places API Details (most accurate)
    if (placeId) {
      const fields = 'id,displayName,formattedAddress,location,photos,addressComponents';
      const r = await fetch(`https://places.googleapis.com/v1/places/${placeId}?fields=${fields}&key=${KEY}`);
      const d = await r.json();
      if (d.location) {
        const photoUrl = d.photos?.[0] ? await fetchPhoto(d.photos[0].name) : null;
        result = {
          lat:      d.location.latitude,
          lng:      d.location.longitude,
          name:     d.displayName?.text ?? rawName ?? '',
          address:  d.formattedAddress ?? '',
          city:     d.addressComponents?.find(c => c.types?.includes('locality'))?.longText ?? '',
          country:  d.addressComponents?.find(c => c.types?.includes('country'))?.longText ?? '',
          photoUrl,
        };
      }
    }

    // B) Coordinates → Reverse Geocoding
    if (!result && lat !== null && lng !== null) {
      const r = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${KEY}`);
      const d = await r.json();
      const top = d.results?.[0];
      if (top) {
        result = {
          lat, lng,
          name:    rawName || getAddrComp(top.address_components, 'point_of_interest') || getAddrComp(top.address_components, 'establishment') || getAddrComp(top.address_components, 'locality'),
          address: top.formatted_address ?? '',
          city:    getAddrComp(top.address_components, 'locality') || getAddrComp(top.address_components, 'administrative_area_level_2'),
          country: getAddrComp(top.address_components, 'country'),
          photoUrl: null,
        };
      }
    }

    // C) Name only → Text Search
    if (!result && rawName) {
      const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.photos,places.addressComponents' },
        body:    JSON.stringify({ textQuery: rawName }),
      });
      const d = await r.json();
      const p = d.places?.[0];
      if (p) {
        const photoUrl = p.photos?.[0] ? await fetchPhoto(p.photos[0].name) : null;
        result = {
          lat:      p.location.latitude,
          lng:      p.location.longitude,
          name:     p.displayName?.text ?? rawName,
          address:  p.formattedAddress ?? '',
          city:     p.addressComponents?.find(c => c.types?.includes('locality'))?.longText ?? '',
          country:  p.addressComponents?.find(c => c.types?.includes('country'))?.longText ?? '',
          photoUrl,
        };
      }
    }

    if (!result) return res.status(400).json({ error: "Couldn't extract location from this URL" });
    res.json(result);
  } catch (err) {
    console.error('resolve-place error:', err);
    res.status(502).json({ error: 'Failed to resolve location' });
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

// ── POST /globe/:id/report ────────────────────────────────────────────────────
router.post('/:id/report', auth, async (req, res) => {
  try {
    const pin = await GlobePin.findById(req.params.id);
    if (!pin) return res.status(404).json({ error: 'Pin not found.' });
    const reason = String(req.body.reason || '').trim().slice(0, 500);
    pin.reports = pin.reports || [];
    pin.reports.push({ userId: req.user._id, reason, createdAt: new Date() });
    await pin.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /globe/:id/report error:', err.message);
    res.status(500).json({ error: 'Failed to submit report.' });
  }
});

module.exports = router;
