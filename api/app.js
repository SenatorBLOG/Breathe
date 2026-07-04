// app.js — Express app assembly, exported without listening so supertest can
// drive it in-process. The HTTP entrypoint lives in server.js.
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

const allowedOrigins = [
  'https://breatheonline.app',
  'https://www.breatheonline.app',
  'https://breathe-two-plum.vercel.app',
  'http://localhost:3000',
  'https://localhost:3000',
  'http://localhost:5173',
  'https://localhost:5173',
  'http://localhost:5174',
  'https://localhost:5174',
];

// Vercel preview deployments for THIS project only (e.g.
// breathe-two-plum-git-branch-user.vercel.app). A bare `.vercel.app` suffix
// check would let ANY attacker-deployed Vercel site call this API with
// credentials — that's why the project slug is pinned.
const VERCEL_PREVIEW_RE = /^https:\/\/breathe-two-plum(-[a-z0-9-]+)?\.vercel\.app$/;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || VERCEL_PREVIEW_RE.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.GLOBAL_RATE_MAX) || 100,
  message: 'Too many requests'
});
app.use(limiter);

// DB connection
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      bufferCommands: false,
      retryWrites: true,
      w: 'majority',
    });
    isConnected = true;
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("DB connection failed:", err.message);
    throw err;
  }
}
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Routes
const authRouter        = require('./routes/auth');
const sessionsRouter    = require('./routes/sessions');
const statsRouter       = require('./routes/stats');
const usersRouter       = require('./routes/users');
const postsRouter       = require('./routes/posts');
const globeRouter       = require('./routes/globe');
const coachRouter       = require('./routes/coach');
const challengesRouter  = require('./routes/challenges');
const leaderboardRouter = require('./routes/leaderboard');
const newsletterRouter  = require('./routes/newsletter');
const supportRouter     = require('./routes/support');
const nlpRouter         = require('./routes/nlp');
const unsubscribeRouter = require('./routes/unsubscribe');
const integrationsRouter = require('./routes/integrations');
const communityRouter    = require('./routes/community');

app.use('/api/auth',         authRouter);
app.use('/api/sessions',     sessionsRouter);
app.use('/api/stats',        statsRouter);
app.use('/api/users',        usersRouter);
app.use('/api/posts',        postsRouter);
app.use('/api/community',    communityRouter);
app.use('/api/globe',        globeRouter);
app.use('/api/coach',        coachRouter);
app.use('/api/challenges',   challengesRouter);
app.use('/api/leaderboard',  leaderboardRouter);
app.use('/api/newsletter',   newsletterRouter);
app.use('/api/support',      supportRouter);
app.use('/api/nlp',          nlpRouter);
app.use('/api/unsubscribe',  unsubscribeRouter);
app.use('/api/integrations', integrationsRouter);

app.get('/api/ping', (req, res) => res.json({ ok: true }));

// Real health check — load balancer uses this to decide whether to route
// traffic. Returns 200 only when MongoDB is reachable and the critical env
// vars are present; otherwise 503 so the platform restarts the container.
app.get('/healthz', async (req, res) => {
  // Hard requirements — app cannot function without these
  const required = {
    mongo: mongoose.connection.readyState === 1,
    jwt:   !!process.env.JWT_SECRET,
  };
  // Soft warnings — missing degrades features but app still runs
  const optional = {
    gemini:    !!process.env.GEMINI_API_KEY,
    mapsApi:   !!process.env.GOOGLE_MAPS_API_KEY,
  };
  const ok = Object.values(required).every(Boolean);
  res.status(ok ? 200 : 503).json({
    status:   ok ? 'ok' : 'degraded',
    required,
    optional,
    uptime:   process.uptime(),
  });
});

app.get('/', (req, res) => res.send('Breathe server is running!'));

module.exports = app;
