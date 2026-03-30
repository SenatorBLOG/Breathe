// routes/challenges.js
const express       = require('express');
const router        = express.Router();
const authenticate  = require('../middleware/auth');
const Challenge     = require('../models/Challenge');
const UserChallenge = require('../models/UserChallenge');
const User          = require('../models/User');
const Session       = require('../models/Session');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// ─── GET /api/challenges — public list with live join counts ─────────────────
router.get('/', async (req, res) => {
  try {
    const [challenges, counts] = await Promise.all([
      Challenge.find().lean(),
      UserChallenge.aggregate([
        { $group: { _id: '$challengeId', live: { $sum: 1 } } },
      ]),
    ]);

    const liveMap = {};
    counts.forEach(c => { liveMap[c._id.toString()] = c.live; });

    const result = challenges.map(ch => ({
      ...ch,
      joinCount: (ch.baseJoinCount ?? 0) + (liveMap[ch._id.toString()] ?? 0),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/challenges/my — user's challenges ───────────────────────────────
router.get('/my', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const userChallenges = await UserChallenge.find({ userId })
      .populate('challengeId')
      .sort({ startedAt: -1 })
      .lean();

    // Rename challengeId → challenge for cleaner frontend API
    const result = userChallenges.map(uc => ({
      ...uc,
      challenge: uc.challengeId,
      challengeId: undefined,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/challenges/recommend — AI recommendation ───────────────────────
router.get('/recommend', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user goal
    const user = await User.findById(userId).select('bodyProfile').lean();
    const goal = user?.bodyProfile?.goal ?? 'general';

    // Get last 7 sessions mood trend
    const sessions = await Session.find({ userId })
      .sort({ sessionDate: -1 })
      .limit(7)
      .select('moodBefore moodAfter sessionLength')
      .lean();

    const moodTrend = sessions.length
      ? `avg mood delta ${(sessions.reduce((s, x) => s + (x.moodAfter - x.moodBefore), 0) / sessions.length).toFixed(1)}, ${sessions.length} sessions`
      : 'no sessions yet';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback without AI
      return res.json({ slug: 'box-7', reason: 'A great starting point for any breathing goal.', challenge: await Challenge.findOne({ slug: 'box-7' }).lean() });
    }

    const prompt = `User goal: ${goal}. Recent mood trend: ${moodTrend}.
Recommend ONE challenge slug from: box-7, morning-7, sleep-7, box-21, anxiety-21, energy-21.
Return JSON only: { "slug": "...", "reason": "one sentence why" }`;

    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 128 },
    };

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const geminiData = await geminiRes.json();
    const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    let jsonStr = raw.trim();
    // Strip markdown fences — Gemini sometimes omits the closing ```
    const fence = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) {
      jsonStr = fence[1].trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/```\s*$/, '').trim();
    }

    const parsed = JSON.parse(jsonStr);
    const slug = parsed.slug ?? 'box-7';
    const challenge = await Challenge.findOne({ slug }).lean();
    res.json({ slug, reason: parsed.reason ?? '', challenge });
  } catch (err) {
    console.error('Challenge recommend error:', err.message);
    // Graceful fallback
    try {
      const challenge = await Challenge.findOne({ slug: 'box-7' }).lean();
      res.json({ slug: 'box-7', reason: 'A great starting point for any goal.', challenge });
    } catch {
      res.status(500).json({ error: 'Failed to generate recommendation' });
    }
  }
});

// ─── POST /api/challenges/:slug/join ─────────────────────────────────────────
router.post('/:slug/join', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const challenge = await Challenge.findOne({ slug: req.params.slug });
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    // Check if already active (not abandoned, not completed)
    const existing = await UserChallenge.findOne({
      userId,
      challengeId:  challenge._id,
      abandonedAt:  null,
      completedAt:  null,
      abandoned:    false,
    });
    if (existing) return res.status(409).json({ error: 'Already in this challenge' });

    const uc = await UserChallenge.create({ userId, challengeId: challenge._id });
    const result = { ...uc.toObject(), challenge: challenge.toObject() };
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/challenges/:id/checkin ────────────────────────────────────────
router.post('/:id/checkin', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const uc = await UserChallenge.findOne({
      _id: req.params.id, userId, completedAt: null, abandoned: false,
    }).populate('challengeId');
    if (!uc) return res.status(404).json({ error: 'Active challenge not found' });

    const today = new Date().toDateString();
    const alreadyDone = uc.completedDays.some(d => new Date(d).toDateString() === today);
    if (alreadyDone) return res.status(409).json({ error: 'Already checked in today' });

    uc.completedDays.push(new Date());

    const challenge = uc.challengeId;
    if (uc.completedDays.length >= challenge.duration) {
      uc.completedAt = new Date();
      uc.badge = { ...challenge.badge, earnedAt: new Date() };
    }
    await uc.save();

    const result = { ...uc.toObject(), challenge: challenge.toObject() };
    res.json({ ok: true, userChallenge: result, completed: !!uc.completedAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/challenges/:id — abandon ────────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const uc = await UserChallenge.findOne({ _id: req.params.id, userId });
    if (!uc) return res.status(404).json({ error: 'Challenge not found' });
    uc.abandoned = true;
    await uc.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
