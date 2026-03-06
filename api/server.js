// api/server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const serverless = require("serverless-http");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

dotenv.config();

const app = express();

// ====== TRUST PROXY ======
app.set("trust proxy", 1); // для Vercel и других прокси

// ====== CORS ======
const allowedOrigins = [
  "https://breatheonline.app",
  "https://www.breatheonline.app",
  "https://breathe-two-plum.vercel.app",
  "http://localhost:3000",
  "https://localhost:3000",
  "http://localhost:5173",
  "https://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ====== SECURITY ======
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json());

// ====== RATE LIMITER ======
// Локально включаем, на Vercel отключаем
if (process.env.NODE_ENV !== "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests",
    keyGenerator: (req) => ipKeyGenerator(req),
  });
  app.use(limiter);
}

// ====== DATABASE ======
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("Connected to MongoDB Atlas");
}
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err.message);
    return res.status(500).json({ error: "Database connection failed" });
  }
});

// ====== ROUTES ======
const authRouter = require("./routes/auth");
const sessionsRouter = require("./routes/sessions");
const statsRouter = require("./routes/stats");

app.use("/api/auth", authRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/stats", statsRouter);

// ====== PING / HEALTHCHECK ======
app.get("/api/ping", (req, res) => res.json({ ok: true }));
app.get("/", (req, res) => res.send("Breathe server is running!"));

// ====== LOCAL SERVER ======
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

// ====== EXPORT FOR VERCEL ======
module.exports = serverless(app);