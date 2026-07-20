// routes/unsubscribe.js
const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { verify } = require('../utils/unsubSign');

const VALID_TYPES = ['welcome', 'reminder', 'weekly'];

const successPage = (message) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unsubscribed — Breathe</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #010814; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #0B1628; border: 1px solid rgba(30,51,88,0.7); border-radius: 20px;
            padding: 48px 40px; max-width: 480px; text-align: center; }
    h1 { color: #B8D9FF; font-size: 22px; font-weight: 600; margin-bottom: 12px; }
    p  { color: #4A7AAA; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
    a  { display: inline-block; background: linear-gradient(135deg,#1A5FCC,#3A82F7);
         color: #fff; text-decoration: none; font-size: 14px; font-weight: 600;
         padding: 12px 28px; border-radius: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <p style="font-size:40px;margin-bottom:16px;">✅</p>
    <h1>You've been unsubscribed</h1>
    <p>${message}</p>
    <a href="https://breatheonline.app">Back to Breathe</a>
  </div>
</body>
</html>`;

const errorPage = (message) => successPage(message).replace('✅', '⚠️').replace("You've been unsubscribed", 'Something went wrong');

// GET /api/unsubscribe?email=...&type=...&sig=...
router.get('/', async (req, res) => {
  const { email, type, sig } = req.query;

  if (!email || !type) {
    return res.status(400).send(errorPage('Missing email or type parameter.'));
  }

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).send(errorPage('Unknown unsubscribe type.'));
  }

  // The HMAC proves this link came from an email we sent to this address —
  // without it, anyone could unsubscribe any address they can guess.
  // Links from before signing existed have no sig: send those users to
  // their profile settings instead of silently failing.
  if (!verify(email, type, sig)) {
    return res.status(403).send(errorPage(
      'This unsubscribe link is invalid or from an older email. ' +
      'You can manage email preferences any time in your profile settings at breatheonline.app/profile.'
    ));
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal whether email exists — just confirm
      return res.send(successPage("You won't receive these emails anymore."));
    }

    const update = { unsubscribedAt: new Date() };
    if (type === 'reminder') update['emailPreferences.reminder'] = false;
    if (type === 'weekly')   update['emailPreferences.weekly']   = false;
    // 'welcome' type — mark both off (one-time email anyway)
    if (type === 'welcome') {
      update['emailPreferences.reminder'] = false;
      update['emailPreferences.weekly']   = false;
    }

    await User.updateOne({ _id: user._id }, { $set: update });

    const messages = {
      reminder: "You won't receive streak reminder emails anymore. You can still log sessions and track your progress.",
      weekly:   "You won't receive weekly summary emails anymore. Your sessions will still be tracked.",
      welcome:  "You've been unsubscribed from all Breathe emails.",
    };

    res.send(successPage(messages[type]));
  } catch (err) {
    console.error('Unsubscribe error:', err.message);
    res.status(500).send(errorPage('Server error. Please try again or contact support.'));
  }
});

module.exports = router;
