const express  = require("express");
const mongoose = require("mongoose");
const dotenv   = require("dotenv");
const cors     = require("cors");
const helmet   = require("helmet");
const rateLimit = require("express-rate-limit");
const cron     = require("node-cron");
dotenv.config();

const { sendReminder, sendWeekly } = require("./services/emailService");
const User    = require("./models/User");
const Session = require("./models/Session");

const app = express();
app.set("trust proxy", 1);

// CORS
const allowedOrigins = [
  "https://breatheonline.app",
  "https://www.breatheonline.app",
  "https://breathe-two-plum.vercel.app",
  "https://breathe-api-amut.onrender.com/api/",
  "http://localhost:3000",
  "https://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(helmet());
app.disable("x-powered-by");
app.use(express.json({ limit: '2mb' }));

// ── Auth rate limit — 10 attempts / 15 min ───────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);

// ── General API rate limit — 300 req / 15 min ────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: "Too many requests. Please slow down." },
});
app.use(limiter);

console.log("MONGO_URI =", process.env.MONGO_URI);
// Mongo connection
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("MongoDB connected");

  // Seed static challenge data
  require('./models/Challenge').seedAll().catch(e => console.error('Challenge seed error:', e.message));
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB connection failed" });
  }
});

// community posts
const postsRouter = require('./routes/posts');
app.use('/api/posts', postsRouter);

// Routes
const authRouter = require("./routes/auth");
const sessionsRouter = require("./routes/sessions");
const statsRouter = require("./routes/stats");

app.use("/api/auth", authRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/stats", statsRouter);
app.use('/api/support', require('./routes/support'));
app.use('/api/coach', require('./routes/coach'));
app.use('/api/nlp',        require('./routes/nlp'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/integrations', require('./routes/integrations'));
app.use('/api/globe',        require('./routes/globe'));
app.use('/api/unsubscribe',  require('./routes/unsubscribe'));
app.use('/api/users',        require('./routes/users'));
app.use('/api/leaderboard',  require('./routes/leaderboard'));

// ── Cron: daily reminder — runs every hour ────────────────────────
// Fires for users whose reminderHour matches the current UTC hour,
// haven't practised in >24 h, and haven't received a reminder today.
cron.schedule('0 * * * *', async () => {
  try {
    const currentHour = new Date().getUTCHours();
    const cutoff24h   = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const todayStart  = new Date(); todayStart.setUTCHours(0, 0, 0, 0);

    const users = await User.find({
      'emailPreferences.reminder':     true,
      'emailPreferences.reminderHour': currentHour,
      unsubscribedAt: { $exists: false },
      email:          { $exists: true },
      $and: [
        { $or: [{ lastSessionAt: { $lt: cutoff24h } }, { lastSessionAt: { $exists: false } }] },
        { $or: [{ reminderEmailSent: { $lt: todayStart } }, { reminderEmailSent: null }] },
      ],
    }).select('email name lastSessionAt').lean();

    for (const u of users) {
      try {
        await sendReminder(u.email, u.name);
        await User.updateOne({ _id: u._id }, { $set: { reminderEmailSent: new Date() } });
        console.log(`📧 Daily reminder sent → ${u.email}`);
      } catch (err) {
        console.error(`Reminder failed for ${u.email}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Reminder cron error:', err.message);
  }
});

// ── Cron: weekly summary — every Sunday at 9am UTC ────────────────
cron.schedule('0 9 * * 0', async () => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const users   = await User.find({
      'emailPreferences.weekly': true,
      unsubscribedAt:            { $exists: false },
      email:                     { $exists: true },
    }).select('email name').lean();

    for (const u of users) {
      try {
        const sessions = await Session.find({
          userId:      u._id,
          sessionDate: { $gte: weekAgo },
        }).lean();

        const sessionCount  = sessions.length;
        const totalMinutes  = sessions.reduce((s, x) => s + (x.sessionLength || 0), 0);
        const moodValues    = sessions.map(x => x.moodAfter).filter(v => v != null);
        const avgMood       = moodValues.length ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length : null;
        const techCount     = {};
        sessions.forEach(x => { if (x.technique) techCount[x.technique] = (techCount[x.technique] || 0) + 1; });
        const topTechnique  = Object.keys(techCount).sort((a, b) => techCount[b] - techCount[a])[0] ?? null;

        await sendWeekly(u.email, u.name, { sessionCount, totalMinutes, avgMood, topTechnique });
        console.log(`📧 Weekly sent → ${u.email}`);
      } catch (err) {
        console.error(`Weekly failed for ${u.email}:`, err.message);
      }
      // 200ms delay between sends to avoid rate limits
      await new Promise(r => setTimeout(r, 200));
    }
  } catch (err) {
    console.error('Weekly cron error:', err.message);
  }
});

// Healthcheck
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

app.get("/", (req, res) => {
  res.send("Breathe API running");
});

// ── Global error handler ─────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  const isDev = process.env.NODE_ENV !== "production";
  res.status(err.status || 500).json({
    error: isDev ? err.message : "Something went wrong",
  });
});

// IMPORTANT for Railway
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});