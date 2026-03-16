// routes/coach.js
const express      = require('express');
const router       = express.Router();
const optionalAuth = require('../middleware/optionalAuth');
const rateLimit    = require('../middleware/coachRateLimit');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are an expert breathing and meditation coach for the Breathe app (breatheonline.app).

Your role:
1. ANALYZE the user's current state — stress, sleep issues, anxiety, low energy, panic, focus problems, etc.
2. RECOMMEND exactly one breathing technique from this list:
   - Box Breathing 4-4-4-4: best for stress, focus, performance anxiety
   - 4-7-8 Breathing: best for sleep, acute anxiety, racing thoughts
   - Wim Hof Method: best for energy, cold exposure, mood boost
   - Coherent Breathing 5.5 BPM: best for HRV improvement, sustained calm
   - Belly Breathing: best for beginners, panic attacks, hyperventilation
   - Alternate Nostril (Nadi Shodhana): best for balance, pre-meditation, clarity
3. EXPLAIN in 1-2 sentences WHY this specific technique helps their situation (cite the science simply)
4. Give EXACT INSTRUCTIONS: inhale X sec, hold X sec, exhale X sec, repeat X cycles
5. End with one sentence of warm encouragement

Rules:
- Max 120 words total
- Conversational, warm, expert but not clinical
- Never diagnose medical conditions
- Never replace professional medical advice — if user describes serious symptoms, gently suggest seeing a doctor alongside the technique
- Always include the technique name in your response so the frontend can detect it
- Respond in the same language the user writes in`;

// ─── POST /api/coach/message ──────────────────────────────────────────────────
router.post('/message', optionalAuth, rateLimit, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.trim().length > 500) {
      return res.status(400).json({ error: 'Message too long (max 500 chars)' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    // Build conversation history for Gemini
    // history = [{ role: 'user'|'model', text: '...' }]
    const contents = [
      // Inject system prompt as first user/model exchange
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT + '\n\nUser message: ' + message.trim() }],
      },
    ];

    // Append previous turns if any (keep last 6 to save tokens)
    const recentHistory = history.slice(-6);
    if (recentHistory.length > 0) {
      // Re-build properly
      contents.length = 0;
      contents.push({ role: 'user', parts: [{ text: SYSTEM_PROMPT }] });
      contents.push({ role: 'model', parts: [{ text: "Understood. I'm your breathing coach. How can I help?" }] });
      recentHistory.forEach(turn => {
        contents.push({ role: turn.role, parts: [{ text: turn.text }] });
      });
      contents.push({ role: 'user', parts: [{ text: message.trim() }] });
    }

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature:     0.7,
          maxOutputTokens: 300,
          topP:            0.8,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', errText);
      return res.status(502).json({ error: 'AI service error. Please try again.' });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(502).json({ error: 'Empty response from AI. Please try again.' });
    }

    // Detect which technique was recommended
    const techniques = [
      { key: 'box',        label: 'Box Breathing',       pattern: /box breathing/i },
      { key: '4-7-8',      label: '4-7-8 Breathing',     pattern: /4-7-8|four.seven.eight/i },
      { key: 'wim-hof',    label: 'Wim Hof Method',      pattern: /wim hof/i },
      { key: 'coherent',   label: 'Coherent Breathing',   pattern: /coherent|5\.5/i },
      { key: 'belly',      label: 'Belly Breathing',      pattern: /belly breathing|diaphragm/i },
      { key: 'alternate',  label: 'Alternate Nostril',    pattern: /alternate nostril|nadi shodhana/i },
    ];

    const detected = techniques.find(t => t.pattern.test(text));

    res.json({
      reply:            text,
      technique:        detected ?? null,
      messagesLeft:     req.coachMessagesLeft ?? null,
      isAuthenticated:  !!req.user,
    });

  } catch (err) {
    console.error('Coach route error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ─── GET /api/coach/status — check remaining messages ─────────────────────────
router.get('/status', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id?.toString() ?? null;
    const ip     = req.ip || 'unknown';
    const key    = userId ? `coach:user:${userId}` : `coach:ip:${ip}`;
    const limit  = userId ? 10 : 3;

    const mongoose = require('mongoose');
    const RateLimit = mongoose.model('RateLimit');
    const doc = await RateLimit.findOne({ key });

    const now   = new Date();
    const used  = (!doc || doc.resetAt <= now) ? 0 : doc.count;
    const left  = Math.max(0, limit - used);

    res.json({ used, limit, left, isAuthenticated: !!userId });
  } catch (err) {
    res.json({ used: 0, limit: 3, left: 3, isAuthenticated: false });
  }
});

module.exports = router;