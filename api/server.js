const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

dotenv.config();

const app = express();
app.set("trust proxy", 1);

// CORS
const allowedOrigins = [
  "https://breatheonline.app",
  "https://www.breatheonline.app",
  "https://breathe-two-plum.vercel.app",
  "https://breathe-production-6cce.up.railway.app",
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
app.use(express.json());

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => ipKeyGenerator(req)
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
app.use('/api/newsletter', require('./routes/newsletter'));

// Healthcheck
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

app.get("/", (req, res) => {
  res.send("Breathe API running");
});

// IMPORTANT for Railway
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});