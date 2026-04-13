const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const serverless = require('serverless-http');
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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

// Routes — point to server-src
const authRouter = require('../server-src/routes/auth');
const sessionsRouter = require('../server-src/routes/sessions');
const statsRouter = require('../server-src/routes/stats');

app.use('/api/auth', authRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/stats', statsRouter);

app.get('/api/ping', (req, res) => res.json({ ok: true }));
app.get('/', (req, res) => res.send('Breathe server is running!'));

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = serverless(app);
