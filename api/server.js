// api/server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const serverless = require('serverless-http');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// --- Load env ---
dotenv.config();

const app = express();
app.set('trust proxy', 1); // for Vercel serverless

// --- DEBUG: show env ---
console.log('ENV GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('ENV MONGO_URI present:', !!process.env.MONGO_URI);
console.log('ENV JWT_SECRET present:', !!process.env.JWT_SECRET);

// --- Allowed origins for CORS ---
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
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json());

// --- Rate limit with safe IPv6 key generator ---
const { ipKeyGenerator } = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: 'Too many requests',
  keyGenerator: (req) => ipKeyGenerator(req),
});
app.use(limiter);

// --- MongoDB connection ---
let isConnected = false;
let connectionPromise = null;

async function connectDB() {
  if (isConnected) return;
  if (connectionPromise) return connectionPromise;  // ждём, если уже коннектится

  connectionPromise = mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 60000,  // 60 сек на выбор сервера
    socketTimeoutMS: 90000,  // 90 сек на сокет
    connectTimeoutMS: 60000,  // 60 сек на коннект
    retryWrites: true,
    retryReads: true,  // retry на чтение
    w: 'majority',
  }).then(() => {
    isConnected = true;
    console.log("MongoDB Atlas connected");
  }).catch(err => {
    console.error("MongoDB connection error:", err.message);
    isConnected = false;
    connectionPromise = null;
    throw err;
  });

  return connectionPromise;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'DB connection failed' });
  }
});

// Middleware to ensure DB connected
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// --- Routes ---
const authRouter = require('./routes/auth');
const sessionsRouter = require('./routes/sessions');
const statsRouter = require('./routes/stats');

app.use('/api/auth', authRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/stats', statsRouter);

// --- Test / Ping ---
app.get('/api/ping', (req, res) => res.json({ ok: true }));
app.get('/', (req, res) => res.send('Breathe server is running!'));

// --- Local dev server ---
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

// --- Export for Vercel ---
module.exports = serverless(app);