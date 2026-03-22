// routes/nlp.js
const express      = require('express');
const router       = express.Router();
const authenticate = require('../middleware/auth');
const Session      = require('../models/Session');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const NLP_SYSTEM_PROMPT = `You are an emotional intelligence analyzer for a breathing and meditation app.
Analyze the provided session notes and return ONLY a valid JSON object with these exact fields:
{
  "sentiment": "positive" | "neutral" | "negative",
  "score": <float from -1.0 to 1.0>,
  "themes": [<1-3 strings from: anxiety, stress, calm, gratitude, focus, fatigue, sadness, joy, overwhelm, peace, frustration, hope, tension, relief, clarity>],
  "intensity": <integer 1-10>,
  "suggestedTechnique": "box-breathing" | "4-7-8" | "wim-hof" | "coherent" | "belly" | "morning-ritual",
  "oneLineSummary": "<one concise sentence describing the emotional state>"
}
Rules:
- Respond ONLY with the JSON object. No markdown, no code blocks, no explanation.
- If notes are very short or unclear, make your best assessment.
- Choose the technique that best addresses the detected emotional state.
- box-breathing: stress, focus, performance anxiety
- 4-7-8: sleep issues, acute anxiety, racing thoughts
- wim-hof: low energy, mood boost needed
- coherent: sustained calm, HRV improvement
- belly: panic, overwhelm, beginners
- morning-ritual: morning fatigue, need for energy and clarity`;

// ─── POST /api/nlp/analyze/:sessionId ────────────────────────────────────────
router.post('/analyze/:sessionId', authenticate, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id:    req.params.sessionId,
      userId: req.user._id,
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!session.notes?.trim()) return res.status(400).json({ error: 'No notes to analyze' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'AI service not configured' });

    const body = {
      systemInstruction: { parts: [{ text: NLP_SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: session.notes.trim() }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 512, topP: 0.9 },
    };

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    const geminiData = await geminiRes.json();
    if (!geminiRes.ok) {
      console.error('Gemini NLP error:', geminiData?.error?.message);
      return res.status(502).json({ error: 'AI service error' });
    }

    const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    if (!raw) return res.status(502).json({ error: 'Empty AI response' });

    // Strip markdown fences if present
    let jsonStr = raw.trim();
    const fence = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) jsonStr = fence[1].trim();

    const nlp = JSON.parse(jsonStr);

    session.nlp = {
      sentiment:          ['positive', 'neutral', 'negative'].includes(nlp.sentiment) ? nlp.sentiment : 'neutral',
      score:              typeof nlp.score === 'number' ? Math.max(-1, Math.min(1, nlp.score)) : 0,
      themes:             Array.isArray(nlp.themes) ? nlp.themes.slice(0, 3) : [],
      intensity:          typeof nlp.intensity === 'number' ? Math.max(1, Math.min(10, Math.round(nlp.intensity))) : 5,
      suggestedTechnique: nlp.suggestedTechnique ?? null,
      oneLineSummary:     nlp.oneLineSummary ?? null,
      analyzedAt:         new Date(),
    };
    await session.save();

    res.json({ ok: true, nlp: session.nlp });
  } catch (err) {
    console.error('NLP analyze error:', err.message);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// ─── GET /api/nlp/insights ────────────────────────────────────────────────────
router.get('/insights', authenticate, async (req, res) => {
  try {
    const sessions = await Session.find({
      userId:          req.user._id,
      'nlp.analyzedAt': { $ne: null },
    }).sort({ sessionDate: -1 }).lean();

    const totalAnalyzed = sessions.length;
    const scores = sessions.map(s => s.nlp?.score).filter(v => v != null);
    const avgScore = scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null;

    const themeCounts = {};
    sessions.forEach(s => {
      (s.nlp?.themes ?? []).forEach(t => {
        themeCounts[t] = (themeCounts[t] || 0) + 1;
      });
    });
    const topThemes = Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([theme, count]) => ({ theme, count }));

    const sentimentDist = { positive: 0, neutral: 0, negative: 0 };
    sessions.forEach(s => {
      if (s.nlp?.sentiment) sentimentDist[s.nlp.sentiment]++;
    });

    // Last 30 days for chart timeline
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const timeline = [...sessions]
      .filter(s => new Date(s.sessionDate) >= since)
      .reverse()
      .map(s => ({
        date:           s.sessionDate,
        score:          s.nlp?.score ?? 0,
        sentiment:      s.nlp?.sentiment ?? 'neutral',
        oneLineSummary: s.nlp?.oneLineSummary ?? '',
      }));

    res.json({ totalAnalyzed, avgScore, topThemes, sentimentDist, timeline, sessions });
  } catch (err) {
    console.error('NLP insights error:', err.message);
    res.status(500).json({ error: 'Failed to load insights' });
  }
});

module.exports = router;
