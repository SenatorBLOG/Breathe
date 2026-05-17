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
  'https://localhost:3000',  // ← add this
  'http://localhost:5173',
  'https://localhost:5173',  // ← add this too
  'http://localhost:5174',
  'https://localhost:5174',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
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
  max: 100,
  message: 'Too many requests'
});
app.use(limiter);

// DB connection
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,  // 30 сек на выбор сервера
      socketTimeoutMS: 45000,  // 45 сек на сокет
      connectTimeoutMS: 30000,  // 30 сек на коннект
      bufferCommands: false,  // отключить buffering, чтоб не висел
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

// Real health check — load balancer / Render uses this to decide whether to
// route traffic. Returns 200 only when MongoDB is reachable and the critical
// env vars are present; otherwise 503 so the platform restarts the container.
app.get('/healthz', async (req, res) => {
  const checks = {
    mongo:  mongoose.connection.readyState === 1,
    gemini: !!process.env.GEMINI_API_KEY,
    jwt:    !!process.env.JWT_SECRET,
  };
  const ok = Object.values(checks).every(Boolean);
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
    checks,
    uptime: process.uptime(),
  });
});

app.get('/', (req, res) => res.send('Breathe server is running!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
