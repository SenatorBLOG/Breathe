// routes/coach.js
const express      = require('express');
const router       = express.Router();
const optionalAuth = require('../middleware/optionalAuth');
const rateLimit    = require('../middleware/coachRateLimit');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

if (!process.env.GEMINI_API_KEY) {
  console.error('⚠️  GEMINI_API_KEY is not set');
} else {
  console.log('✅ GEMINI_API_KEY loaded, length:', process.env.GEMINI_API_KEY.length);
}

const SYSTEM_PROMPT = `You are an expert breathing and meditation coach for the Breathe app (breatheonline.app).

Your role:
1. ANALYZE the user's current state — stress, sleep issues, anxiety, low energy, panic, focus problems.
2. RECOMMEND exactly one breathing technique from:
   - Box Breathing 4-4-4-4: stress, focus, performance anxiety
   - 4-7-8 Breathing: sleep, acute anxiety, racing thoughts
   - Wim Hof Method: energy, mood boost
   - Coherent Breathing 5.5 BPM: HRV improvement, sustained calm
   - Belly Breathing: beginners, panic attacks
   - Alternate Nostril (Nadi Shodhana): balance, clarity
3. EXPLAIN in 1-2 sentences WHY this technique helps (simple science)
4. Give EXACT INSTRUCTIONS: inhale X sec, hold X sec, exhale X sec, repeat X cycles
5. End with one sentence of warm encouragement

Rules:
- Max 120 words total
- Warm, expert, conversational tone
- Never diagnose medical conditions
- Always include the technique name so frontend can detect it
- Respond in the same language the user writes in`;

// ─── POST /api/coach/message ──────────────────────────────────────────────────
router.post('/message', optionalAuth, rateLimit, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || message.trim().length === 0)
      return res.status(400).json({ error: 'Message is required' });

    if (message.trim().length > 500)
      return res.status(400).json({ error: 'Message too long (max 500 chars)' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
      return res.status(500).json({ error: 'AI service not configured' });

    // Build contents array — only user/model turns, NO system in contents
    const contents = [];

    // Add conversation history (last 6 turns)
    const recent = history.slice(-6);
    for (const turn of recent) {
      contents.push({
        role:  turn.role === 'model' ? 'model' : 'user',
        parts: [{ text: turn.text }],
      });
    }

    // Add current user message
    contents.push({
      role:  'user',
      parts: [{ text: message.trim() }],
    });

    const body = {
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents,
      generationConfig: {
        temperature:     0.7,
        maxOutputTokens: 1024,
        topP:            0.8,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    };

    console.log('Calling Gemini, messages:', contents.length);

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Gemini API error status:', geminiRes.status);
      console.error('Gemini API error body:', JSON.stringify(geminiData));
      return res.status(502).json({
        error:  'AI service error. Please try again.',
        detail: geminiData?.error?.message ?? `Gemini status ${geminiRes.status}`,
        gemini: geminiData?.error,
      });
    }
    console.log('Gemini success, candidate count:', geminiData?.candidates?.length);

    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('Empty Gemini response:', JSON.stringify(geminiData));
      return res.status(502).json({ error: 'Empty response from AI. Please try again.' });
    }

    // Detect recommended technique
    const techniques = [
      { key: 'box',       label: 'Box Breathing',     pattern: /box breathing/i },
      { key: '4-7-8',     label: '4-7-8 Breathing',   pattern: /4-7-8|four.seven.eight/i },
      { key: 'wim-hof',   label: 'Wim Hof Method',    pattern: /wim hof/i },
      { key: 'coherent',  label: 'Coherent Breathing', pattern: /coherent|5\.5/i },
      { key: 'belly',     label: 'Belly Breathing',    pattern: /belly breathing|diaphragm/i },
      { key: 'alternate', label: 'Alternate Nostril',  pattern: /alternate nostril|nadi shodhana/i },
    ];
    const detected = techniques.find(t => t.pattern.test(text)) ?? null;

    res.json({
      reply:           text,
      technique:       detected,
      messagesLeft:    req.coachMessagesLeft ?? null,
      isAuthenticated: !!req.user,
    });

  } catch (err) {
    console.error('Coach route error:', err.message, err.stack);
    res.status(500).json({ error: 'Something went wrong. Please try again.', detail: err.message });
  }
});

// ─── POST /api/coach/sleep-story ─────────────────────────────────────────────
router.post('/sleep-story', optionalAuth, async (req, res) => {
  try {
    const { theme = 'a quiet forest at dusk', duration = 'medium', language = 'en' } = req.body;

    const WORD_COUNTS = { short: 250, medium: 600, long: 1200 };
    const words = WORD_COUNTS[duration] || 600;

    const LANG_INSTRUCTION = {
      en: 'Write in English.',
      ru: 'Напиши на русском языке.',
      es: 'Escribe en español.',
    };

    const prompt = `You are a professional sleep story writer for a meditation app.

Write a calming bedtime story (~${words} words) set in: ${theme}

Rules:
- Slow, hypnotic pace — short sentences, lots of sensory description
- No conflict, no plot twists, no excitement
- Progressively slower and quieter as story continues
- Heavy on texture: soft light, gentle sounds, warm air, comfortable ground
- End with the character drifting into peaceful sleep
- Second person ("you") — the reader is the main character
- No chapter headings, no titles, just the story
${LANG_INSTRUCTION[language] || LANG_INSTRUCTION.en}

Begin the story immediately. No preamble.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'AI service not configured' });

    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 2048, topP: 0.95 },
    };

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    const geminiData = await geminiRes.json();
    if (!geminiRes.ok) {
      console.error('Gemini sleep-story error:', geminiData?.error?.message);
      return res.status(502).json({ error: 'Story generation failed. Please try again.' });
    }

    const story = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!story) return res.status(502).json({ error: 'Empty response from AI' });

    res.json({ story, theme, duration });
  } catch (err) {
    console.error('Sleep story error:', err.message);
    res.status(500).json({ error: 'Story generation failed' });
  }
});

// ─── GET /api/coach/status ────────────────────────────────────────────────────
router.get('/status', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id?.toString() ?? null;
    const ip     = req.ip || 'unknown';
    const key    = userId ? `coach:user:${userId}` : `coach:ip:${ip}`;
    const limit  = userId ? 10 : 3;

    const mongoose  = require('mongoose');
    const RateLimit = mongoose.model('RateLimit');
    const doc       = await RateLimit.findOne({ key });
    const now       = new Date();
    const used      = (!doc || doc.resetAt <= now) ? 0 : doc.count;

    res.json({ used, limit, left: Math.max(0, limit - used), isAuthenticated: !!userId });
  } catch {
    res.json({ used: 0, limit: 3, left: 3, isAuthenticated: false });
  }
});


module.exports = router;