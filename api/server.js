const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const serverless = require('serverless-http');

dotenv.config();

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/api/ping', (req, res) => res.json({ ok: true, time: Date.now() }));

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
  isConnected = true;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed: " + err.message });
  }
});

const authRouter = require('../server-src/routes/auth');
const sessionsRouter = require('../server-src/routes/sessions');
const statsRouter = require('../server-src/routes/stats');

app.use('/api/auth', authRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/stats', statsRouter);

module.exports = serverless(app);