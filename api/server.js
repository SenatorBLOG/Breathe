// api/server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const serverless = require('serverless-http');
const path = require('path');

dotenv.config();

const app = express();
const allowedOrigins = [
  'https://breatheonline.app',
  'https://www.breatheonline.app',
  'https://breathe-two-plum.vercel.app',
  'http://localhost:3000',
  'https://localhost:3000', // Твой текущий случай в логах
  'http://localhost:5173',
  'https://localhost:5173'
];

app.use(cors({
  origin: function (origin=true, callback) {
    // Разрешаем запросы без origin (например, мобильные приложения)
    if (!origin) return callback(null, true);
    
    // Проверяем вхождение в белый список или поддомены vercel
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log("CORS Rejected Origin:", origin); // Увидишь в логах верселя, если кто-то другой стучится
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());

const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://accounts.google.com", "https://www.gstatic.com", "'unsafe-inline'"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      // Добавляем домен верселя в connectSrc
      connectSrc: ["'self'", "https://accounts.google.com", "https://*.googleapis.com", "https://breathe-two-plum.vercel.app"],
      imgSrc: ["'self'", "data:", "https://lh3.googleusercontent.com"],
    },
  },
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // request limit
  message: 'Too many request'
});
app.use(limiter); // global, or only on /auth
app.use('/api/auth', limiter); // for login/register

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

console.log("DEBUG: connecting to", MONGO_URI);
// console.log("BASE URL IS:", api.defaults.baseURL);

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGO_URI);
  isConnected = true;
  console.log("Connected to MongoDB Atlas");
}

// Replace app.use(express.json()) and routes section with:
app.use(express.json());
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Keep all your routes as-is
app.use('/api/auth', authRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/stats', statsRouter);

app.get('/', (req, res) => {
  res.send('Breathe server is running!');
});
//test endpoint
app.get('/api/ping', (req, res) => res.json({ ok: true }));

// REMOVE app.listen entirely — replace with:
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = serverless(app);
