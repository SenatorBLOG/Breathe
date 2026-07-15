// routes/support.js
const express   = require('express');
const router    = express.Router();
const rateLimit = require('express-rate-limit');
const SupportTicket = require('../models/SupportTicket');

const supportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,                    // 5 tickets per hour per IP — stops ticket floods
  message: { error: 'Too many messages. Please try again later.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// ─── POST /api/support — submit a support message ────────────────────────────
router.post('/', supportLimiter, async (req, res) => {
  try {
    const { name, email, category, message } = req.body;

    // Basic validation + size caps (unbounded strings = storage abuse)
    if (!name?.trim())    return res.status(400).json({ error: 'Name is required' });
    if (!email?.includes('@')) return res.status(400).json({ error: 'Valid email is required' });
    if (!message?.trim() || message.trim().length < 10)
      return res.status(400).json({ error: 'Message must be at least 10 characters' });
    if (message.length > 5000)
      return res.status(400).json({ error: 'Message too long (max 5000 characters)' });

    // Save to DB
    const ticket = await SupportTicket.create({
      name:     name.trim().slice(0, 100),
      email:    email.trim().toLowerCase().slice(0, 200),
      category: category || 'other',
      message:  message.trim(),
    });

    // ── Optional: send email notification to yourself ──────────────────────
    // Uncomment this block and add SMTP vars to Railway env if you want email alerts:
    //
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,       // e.g. smtp.gmail.com
    //   port: 587,
    //   auth: {
    //     user: process.env.SMTP_USER,     // your email
    //     pass: process.env.SMTP_PASS,     // app password
    //   },
    // });
    // await transporter.sendMail({
    //   from: process.env.SMTP_USER,
    //   to:   process.env.SUPPORT_EMAIL ?? process.env.SMTP_USER,
    //   subject: `[Breathe Support] ${category} from ${name}`,
    //   text: `From: ${name} <${email}>\nCategory: ${category}\n\n${message}`,
    // });
    // ──────────────────────────────────────────────────────────────────────

    res.status(201).json({ ok: true, id: ticket._id });
  } catch (err) {
    console.error('Support ticket error:', err);
    res.status(500).json({ error: 'Failed to submit. Please try again.' });
  }
});

// ─── GET /api/support — list tickets (add your own admin auth if needed) ──────
// router.get('/', adminAuth, async (req, res) => {
//   const tickets = await SupportTicket.find().sort({ createdAt: -1 });
//   res.json(tickets);
// });

module.exports = router;