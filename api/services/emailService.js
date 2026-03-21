// services/emailService.js
const { Resend } = require('resend');
const { welcomeHtml } = require('../emails/welcome');
const { reminderHtml } = require('../emails/reminder');
const { weeklyHtml }   = require('../emails/weekly');

const FROM = 'Breathe <hello@breatheonline.app>';

// Lazy init — avoids throwing at boot when key is absent (local dev)
let _resend = null;
function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not set');
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

async function sendWelcome(email, name) {
  await getResend().emails.send({
    from:    FROM,
    to:      email,
    subject: '🌬 Welcome to Breathe — your practice starts now',
    html:    welcomeHtml({ name, email }),
  });
}

async function sendReminder(email, name, daysSince) {
  await getResend().emails.send({
    from:    FROM,
    to:      email,
    subject: `Hey ${name || 'there'} — you haven't breathed in ${daysSince} days 🌊`,
    html:    reminderHtml({ name, email, daysSince }),
  });
}

async function sendWeekly(email, name, stats) {
  await getResend().emails.send({
    from:    FROM,
    to:      email,
    subject: '📊 Your weekly Breathe summary',
    html:    weeklyHtml({ name, email, stats }),
  });
}

module.exports = { sendWelcome, sendReminder, sendWeekly };
