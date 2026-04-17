// routes/integrations.js
const express     = require('express');
const router      = express.Router();
const auth        = require('../middleware/auth');
const Integration = require('../models/Integration');

const {
  FITBIT_CLIENT_ID,      FITBIT_CLIENT_SECRET,
  GOOGLE_FIT_CLIENT_ID,  GOOGLE_FIT_CLIENT_SECRET,
} = process.env;

const BASE_URL = 'https://breatheonline.app';

// ─── Helper: refresh Fitbit token ────────────────────────────────────────────
async function refreshFitbitToken(integration) {
  const creds  = Buffer.from(`${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`).toString('base64');
  const res    = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: integration.refreshToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.[0]?.message ?? 'Fitbit refresh failed');
  integration.accessToken  = data.access_token;
  integration.refreshToken = data.refresh_token;
  integration.expiresAt    = new Date(Date.now() + data.expires_in * 1000);
  await integration.save();
  return integration;
}

// ─── Helper: refresh Google token ────────────────────────────────────────────
async function refreshGoogleToken(integration) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     GOOGLE_FIT_CLIENT_ID,
      client_secret: GOOGLE_FIT_CLIENT_SECRET,
      refresh_token: integration.refreshToken,
      grant_type:    'refresh_token',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description ?? 'Google refresh failed');
  integration.accessToken = data.access_token;
  integration.expiresAt   = new Date(Date.now() + data.expires_in * 1000);
  await integration.save();
  return integration;
}

// ─── Helper: ensure valid token ───────────────────────────────────────────────
async function ensureToken(integration) {
  if (!integration.expiresAt || integration.expiresAt > new Date(Date.now() + 60000)) return integration;
  if (integration.provider === 'fitbit')     return refreshFitbitToken(integration);
  if (integration.provider === 'google_fit') return refreshGoogleToken(integration);
  return integration;
}

// ════════════════════════════════════════════════════════
//  FITBIT
// ════════════════════════════════════════════════════════

// GET /api/integrations/fitbit/connect
router.get('/fitbit/connect', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.query.token;
    if (!token) return res.redirect(`${BASE_URL}/profile?integration=fitbit&status=error`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId  = decoded.userId ?? decoded.id ?? decoded._id;
    const params = new URLSearchParams({
      client_id:     FITBIT_CLIENT_ID,
      response_type: 'code',
      scope:         'sleep heartrate activity',
      redirect_uri:  `${BASE_URL}/api/integrations/fitbit/callback`,
      state:         userId.toString(),
    });
    res.redirect(`https://www.fitbit.com/oauth2/authorize?${params}`);
  } catch (err) {
    console.error('Fitbit connect error:', err.message);
    res.redirect(`${BASE_URL}/profile?integration=fitbit&status=error`);
  }
});

// GET /api/integrations/fitbit/callback
router.get('/fitbit/callback', async (req, res) => {
  const { code, state: userId, error } = req.query;
  if (error || !code) return res.redirect(`${BASE_URL}/profile?integration=fitbit&status=error`);

  try {
    const creds = Buffer.from(`${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`).toString('base64');
    const tokenRes = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, grant_type: 'authorization_code',
        redirect_uri: `${BASE_URL}/api/integrations/fitbit/callback`,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.errors?.[0]?.message ?? 'Token exchange failed');

    await Integration.findOneAndUpdate(
      { userId, provider: 'fitbit' },
      {
        userId, provider: 'fitbit',
        accessToken:  tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt:    new Date(Date.now() + tokenData.expires_in * 1000),
        scope:        tokenData.scope,
      },
      { upsert: true }
    );

    res.redirect(`${BASE_URL}/profile?integration=fitbit&status=connected`);
  } catch (err) {
    console.error('Fitbit callback error:', err.message);
    res.redirect(`${BASE_URL}/profile?integration=fitbit&status=error`);
  }
});

// ════════════════════════════════════════════════════════
//  GOOGLE FIT
// ════════════════════════════════════════════════════════

// GET /api/integrations/google-fit/connect
router.get('/google-fit/connect', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.query.token;
    if (!token) return res.redirect(`${BASE_URL}/profile?integration=google_fit&status=error`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId  = decoded.userId ?? decoded.id ?? decoded._id;
    const params = new URLSearchParams({
      client_id:     GOOGLE_FIT_CLIENT_ID,
      redirect_uri:  `${BASE_URL}/api/integrations/google-fit/callback`,
      response_type: 'code',
      scope:         'https://www.googleapis.com/auth/fitness.sleep.read https://www.googleapis.com/auth/fitness.heart_rate.read',
      access_type:   'offline',
      prompt:        'consent',
      state:         userId.toString(),
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  } catch (err) {
    console.error('Google Fit connect error:', err.message);
    res.redirect(`${BASE_URL}/profile?integration=google_fit&status=error`);
  }
});

// GET /api/integrations/google-fit/callback
router.get('/google-fit/callback', async (req, res) => {
  const { code, state: userId, error } = req.query;
  if (error || !code) return res.redirect(`${BASE_URL}/profile?integration=google_fit&status=error`);

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     GOOGLE_FIT_CLIENT_ID,
        client_secret: GOOGLE_FIT_CLIENT_SECRET,
        redirect_uri:  `${BASE_URL}/api/integrations/google-fit/callback`,
        grant_type:    'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error_description ?? 'Token exchange failed');

    await Integration.findOneAndUpdate(
      { userId, provider: 'google_fit' },
      {
        userId, provider: 'google_fit',
        accessToken:  tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt:    new Date(Date.now() + tokenData.expires_in * 1000),
        scope:        tokenData.scope,
      },
      { upsert: true }
    );

    res.redirect(`${BASE_URL}/profile?integration=google_fit&status=connected`);
  } catch (err) {
    console.error('Google Fit callback error:', err.message);
    res.redirect(`${BASE_URL}/profile?integration=google_fit&status=error`);
  }
});

// ════════════════════════════════════════════════════════
//  SYNC — fetch latest data from connected services
// ════════════════════════════════════════════════════════

// POST /api/integrations/sync — fetch sleep + HRV for last 7 days
router.post('/sync', auth, async (req, res) => {
  try {
    const userId      = req.user._id;
    const integrations = await Integration.find({ userId });
    if (!integrations.length) return res.json({ synced: [], data: {} });

    const result = {};

    for (let integ of integrations) {
      try {
        integ = await ensureToken(integ);

        if (integ.provider === 'fitbit') {
          // Sleep — last 7 days
          const today    = new Date().toISOString().split('T')[0];
          const weekAgo  = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
          const sleepRes = await fetch(
            `https://api.fitbit.com/1.2/user/-/sleep/date/${weekAgo}/${today}.json`,
            { headers: { Authorization: `Bearer ${integ.accessToken}` } }
          );
          const sleepData = await sleepRes.json();

          // HRV — last 7 days
          const hrvRes  = await fetch(
            `https://api.fitbit.com/1/user/-/hrv/date/${weekAgo}/${today}.json`,
            { headers: { Authorization: `Bearer ${integ.accessToken}` } }
          );
          const hrvData = await hrvRes.json();

          // Resting heart rate
          const hrRes  = await fetch(
            `https://api.fitbit.com/1/user/-/activities/heart/date/today/7d.json`,
            { headers: { Authorization: `Bearer ${integ.accessToken}` } }
          );
          const hrData = await hrRes.json();

          const processed = processFitbitData(sleepData, hrvData, hrData);
          await Integration.findByIdAndUpdate(integ._id, {
            'data.sleep': processed.sleep,
            'data.hrv':   processed.hrv,
            'data.heartRate': processed.heartRate,
            lastSyncAt:   new Date(),
          });
          result.fitbit = processed;
        }

        if (integ.provider === 'google_fit') {
          const endMs   = Date.now();
          const startMs = endMs - 7 * 86400000;
          const body    = {
            aggregateBy: [
              { dataTypeName: 'com.google.sleep.segment' },
              { dataTypeName: 'com.google.heart_rate.bpm' },
            ],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: startMs,
            endTimeMillis:   endMs,
          };
          const fitRes  = await fetch(
            'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
            {
              method:  'POST',
              headers: { Authorization: `Bearer ${integ.accessToken}`, 'Content-Type': 'application/json' },
              body:    JSON.stringify(body),
            }
          );
          const fitData  = await fitRes.json();
          const processed = processGoogleFitData(fitData);
          await Integration.findByIdAndUpdate(integ._id, {
            'data.sleep':     processed.sleep,
            'data.heartRate': processed.heartRate,
            lastSyncAt:       new Date(),
          });
          result.google_fit = processed;
        }
      } catch (err) {
        console.error(`Sync error for ${integ.provider}:`, err.message);
        result[integ.provider] = { error: err.message };
      }
    }

    res.json({ synced: Object.keys(result), data: result });
  } catch (err) {
    console.error('Sync error:', err.message);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// GET /api/integrations/status — which services are connected + latest data
router.get('/status', auth, async (req, res) => {
  try {
    const integrations = await Integration.find({ userId: req.user._id });
    const status = integrations.map(i => ({
      provider:    i.provider,
      connected:   true,
      lastSyncAt:  i.lastSyncAt,
      data:        i.data,
    }));
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/integrations/:provider — disconnect
router.delete('/:provider', auth, async (req, res) => {
  try {
    await Integration.findOneAndDelete({ userId: req.user._id, provider: req.params.provider });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════
//  DATA PROCESSORS
// ════════════════════════════════════════════════════════
function processFitbitData(sleepData, hrvData, hrData) {
  const sleep = (sleepData.sleep || []).map(s => ({
    date:        s.dateOfSleep,
    duration:    Math.round(s.duration / 60000),    // ms → minutes
    efficiency:  s.efficiency,
    score:       s.levels?.summary ? computeSleepScore(s) : null,
    deepMins:    s.levels?.summary?.deep?.minutes   ?? 0,
    remMins:     s.levels?.summary?.rem?.minutes    ?? 0,
    lightMins:   s.levels?.summary?.light?.minutes  ?? 0,
    awakeMins:   s.levels?.summary?.wake?.minutes   ?? 0,
  }));

  const hrv = (hrvData.hrv || []).map(h => ({
    date:  h.dateTime,
    rmssd: h.value?.dailyRmssd   ?? null,
    deep:  h.value?.deepRmssd    ?? null,
  }));

  const heartRate = (hrData['activities-heart'] || []).map(h => ({
    date:        h.dateTime,
    restingRate: h.value?.restingHeartRate ?? null,
  }));

  return { sleep, hrv, heartRate };
}

function computeSleepScore(s) {
  const deep  = s.levels?.summary?.deep?.minutes  ?? 0;
  const rem   = s.levels?.summary?.rem?.minutes   ?? 0;
  const eff   = s.efficiency ?? 80;
  return Math.min(100, Math.round((deep + rem) / 2 + eff * 0.3));
}

function processGoogleFitData(fitData) {
  const sleep = []; const heartRate = [];
  (fitData.bucket || []).forEach(bucket => {
    const date = new Date(parseInt(bucket.startTimeMillis)).toISOString().split('T')[0];
    bucket.dataset?.forEach(ds => {
      if (ds.dataSourceId?.includes('sleep')) {
        const totalMins = (ds.point || []).reduce((sum, p) => {
          return sum + Math.round((p.endTimeNanos - p.startTimeNanos) / 60e9);
        }, 0);
        if (totalMins > 0) sleep.push({ date, duration: totalMins });
      }
      if (ds.dataSourceId?.includes('heart_rate')) {
        const vals = (ds.point || []).map(p => p.value?.[0]?.fpVal).filter(Boolean);
        if (vals.length) heartRate.push({ date, avgRate: Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) });
      }
    });
  });
  return { sleep, heartRate };
}

// ─── POST /api/integrations/apple-health ─────────────────────────────────────
const VALID_SLEEP_STAGES = ['DEEP', 'LIGHT', 'REM', 'AWAKE'];

function normalizeSleepDay(day) {
  if (!day || typeof day !== 'object') return day;
  const out = { ...day };
  if (day.stages !== undefined) {
    if (!Array.isArray(day.stages)) {
      throw new Error('stages must be an array');
    }
    for (const seg of day.stages) {
      if (!seg || typeof seg !== 'object') {
        throw new Error('stage segment must be an object');
      }
      if (typeof seg.startMin !== 'number' || !Number.isFinite(seg.startMin)) {
        throw new Error('stage segment startMin must be a finite number');
      }
      if (typeof seg.endMin !== 'number' || !Number.isFinite(seg.endMin)) {
        throw new Error('stage segment endMin must be a finite number');
      }
      if (!VALID_SLEEP_STAGES.includes(seg.stage)) {
        throw new Error(`stage segment stage must be one of ${VALID_SLEEP_STAGES.join(', ')}`);
      }
    }
    out.stages = day.stages.map(s => ({
      startMin: s.startMin,
      endMin:   s.endMin,
      stage:    s.stage,
    }));
  }
  if (day.bedtime  !== undefined) out.bedtime  = day.bedtime;
  if (day.wakeTime !== undefined) out.wakeTime = day.wakeTime;
  if (day.score    !== undefined) out.score    = day.score;
  return out;
}

router.post('/apple-health', auth, async (req, res) => {
  try {
    const { sleep, hrv, heartRate } = req.body;
    if (!sleep?.length && !hrv?.length) {
      return res.status(400).json({ error: 'No health data provided' });
    }

    let normalizedSleep;
    try {
      normalizedSleep = Array.isArray(sleep) ? sleep.map(normalizeSleepDay) : (sleep ?? []);
    } catch (validationErr) {
      return res.status(400).json({ error: validationErr.message });
    }

    await Integration.findOneAndUpdate(
      { userId: req.user._id, provider: 'apple_health' },
      {
        userId:       req.user._id,
        provider:     'apple_health',
        accessToken:  'file_import', // no OAuth for Apple
        lastSyncAt:   new Date(),
        'data.sleep':     normalizedSleep,
        'data.hrv':       hrv       ?? [],
        'data.heartRate': heartRate ?? [],
      },
      { upsert: true, returnDocument: 'after' }
    );

    res.json({ ok: true, days: sleep?.length ?? 0 });
  } catch (err) {
    console.error('Apple Health import error:', err.message);
    res.status(500).json({ error: 'Failed to save health data' });
  }
});

module.exports = router;