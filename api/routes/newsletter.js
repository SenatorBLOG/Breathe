// routes/newsletter.js
const express  = require('express');
const router   = express.Router();
const crypto   = require('crypto');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');

// ─── Helper: send email via Resend ───────────────────────────────────────────
async function sendEmail({ to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from:    'Breathe <hello@breatheonline.app>',
      to,
      subject,
      html,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Resend error');
  return data;
}

// ─── Weekly tip content ───────────────────────────────────────────────────────
const WEEKLY_TIPS = [
  { title: 'Try Box Breathing today',      body: 'Inhale 4s · Hold 4s · Exhale 4s · Hold 4s. Repeat 4 cycles before your most stressful meeting this week.' },
  { title: 'The 4-7-8 sleep trick',        body: 'Tonight, try 4-7-8 breathing in bed: inhale 4s, hold 7s, exhale 8s. Three cycles and most people are asleep.' },
  { title: 'Coherent breathing for focus', body: 'Breathe in for 5.5 seconds, out for 5.5 seconds. Do this for 5 minutes and watch your HRV — and focus — improve.' },
  { title: 'Morning Wim Hof reset',        body: 'Start tomorrow with 30 deep power breaths, then hold on empty for as long as comfortable. Natural coffee, no caffeine needed.' },
  { title: 'The 60-second reset',          body: 'Feeling overwhelmed? Just one minute of slow exhales (longer out than in) activates your parasympathetic system instantly.' },
];

function getTipOfTheWeek() {
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return WEEKLY_TIPS[week % WEEKLY_TIPS.length];
}

function buildEmailHtml({ tip, unsubUrl }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#010814;font-family:'Montserrat',Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#7AC4FF,#1A5FCC 65%);margin-bottom:12px;"></div>
      <p style="color:#4A9EFF;font-size:18px;font-weight:500;margin:0;letter-spacing:0.1em;">Breathe</p>
    </div>

    <!-- Card -->
    <div style="background:#0B1628;border:1px solid #1E3358;border-radius:20px;padding:32px;margin-bottom:24px;">
      <p style="color:#3D6080;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;margin:0 0 8px;">Weekly Calm · Sunday tip</p>
      <h1 style="color:#B8D9FF;font-size:20px;font-weight:500;margin:0 0 16px;line-height:1.4;">${tip.title}</h1>
      <p style="color:#5A8FB8;font-size:14px;line-height:1.7;margin:0 0 24px;">${tip.body}</p>

      <a href="https://breatheonline.app/breathing"
        style="display:inline-block;background:linear-gradient(135deg,#1A5FCC,#3A82F7);color:#fff;text-decoration:none;padding:12px 28px;border-radius:100px;font-size:13px;font-weight:500;letter-spacing:0.05em;">
        <img src="/icons/1.blow.webp" alt="" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;" /> Try it now
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;">
      <p style="color:#1E3358;font-size:11px;margin:0 0 8px;">
        You're receiving this because you subscribed on breatheonline.app
      </p>
      <a href="${unsubUrl}" style="color:#2A4060;font-size:11px;text-decoration:underline;">
        Unsubscribe
      </a>
    </div>
  </div>
</body>
</html>`;
}

// ─── POST /api/newsletter/subscribe ──────────────────────────────────────────
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@'))
      return res.status(400).json({ error: 'Valid email required' });

    const unsubToken = crypto.randomBytes(24).toString('hex');

    await NewsletterSubscriber.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { email: email.trim().toLowerCase(), active: true, unsubToken },
      { upsert: true, returnDocument: 'after' }
    );

    // Welcome email
    if (process.env.RESEND_API_KEY) {
      const tip = getTipOfTheWeek();
      const unsubUrl = `https://breatheonline.app/api/newsletter/unsubscribe?token=${unsubToken}`;
      await sendEmail({
        to:      email,
        subject: '🌊 Welcome to Weekly Calm',
        html:    buildEmailHtml({ tip, unsubUrl }),
      }).catch(err => console.error('Welcome email failed:', err.message));
    }

    res.json({ ok: true, message: 'Subscribed! Check your inbox.' });
  } catch (err) {
    if (err.code === 11000) return res.json({ ok: true, message: 'Already subscribed!' });
    console.error('Subscribe error:', err.message);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// ─── GET /api/newsletter/unsubscribe?token=xxx ────────────────────────────────
router.get('/unsubscribe', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send('Invalid link');

    await NewsletterSubscriber.findOneAndUpdate({ unsubToken: token }, { active: false });
    res.send(`
      <html><body style="background:#010814;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:Arial">
        <div style="text-align:center;color:#B8D9FF">
          <p style="font-size:32px">🌊</p>
          <h2 style="font-weight:400">Unsubscribed</h2>
          <p style="color:#3D6080;font-size:14px">You've been removed from Weekly Calm.</p>
          <a href="https://breatheonline.app" style="color:#4A9EFF;font-size:13px">← Back to Breathe</a>
        </div>
      </body></html>
    `);
  } catch (err) {
    res.status(500).send('Something went wrong');
  }
});

// ─── POST /api/newsletter/send-weekly ────────────────────────────────────────
// Call this from a cron job every Sunday
// Protect with a secret key so only your cron can trigger it
router.post('/send-weekly', async (req, res) => {
  const secret = req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET)
    return res.status(401).json({ error: 'Unauthorized' });

  try {
    const subscribers = await NewsletterSubscriber.find({ active: true });
    if (!subscribers.length) return res.json({ sent: 0 });

    const tip = getTipOfTheWeek();
    let sent = 0, failed = 0;

    for (const sub of subscribers) {
      try {
        const unsubUrl = `https://breatheonline.app/api/newsletter/unsubscribe?token=${sub.unsubToken}`;
        await sendEmail({
          to:      sub.email,
          subject: `🌊 Weekly Calm: ${tip.title}`,
          html:    buildEmailHtml({ tip, unsubUrl }),
        });
        sent++;
        // Small delay to stay within rate limits
        await new Promise(r => setTimeout(r, 100));
      } catch (err) {
        console.error(`Failed to send to ${sub.email}:`, err.message);
        failed++;
      }
    }

    console.log(`Weekly newsletter sent: ${sent} ok, ${failed} failed`);
    res.json({ sent, failed, total: subscribers.length });
  } catch (err) {
    console.error('Send weekly error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;