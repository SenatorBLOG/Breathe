// middleware/coachRateLimit.js
const mongoose = require('mongoose');

// Simple rate limit stored in MongoDB
// Schema: { key, count, resetAt }
const RateLimitSchema = new mongoose.Schema({
  key:     { type: String, required: true, unique: true },
  count:   { type: Number, default: 0 },
  resetAt: { type: Date, required: true },
}, { timestamps: false });

const RateLimit = mongoose.models.RateLimit || mongoose.model('RateLimit', RateLimitSchema);

const LIMITS = {
  anonymous: 3,
  user:      10,
  premium:   999,
};

module.exports = async function coachRateLimit(req, res, next) {
  try {
    const userId = req.user?._id?.toString() ?? null;
    const ip     = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const key    = userId ? `coach:user:${userId}` : `coach:ip:${ip}`;
    const limit  = userId ? LIMITS.user : LIMITS.anonymous;

    const now       = new Date();
    const midnight  = new Date();
    midnight.setHours(24, 0, 0, 0); // next midnight

    // Upsert rate limit doc
    let doc = await RateLimit.findOne({ key });

    if (!doc || doc.resetAt <= now) {
      // First message today or reset
      doc = await RateLimit.findOneAndUpdate(
        { key },
        { key, count: 1, resetAt: midnight },
        { upsert: true, new: true }
      );
      req.coachMessagesLeft = limit - 1;
      return next();
    }

    if (doc.count >= limit) {
      const msLeft    = doc.resetAt - now;
      const hoursLeft = Math.ceil(msLeft / 3600000);
      return res.status(429).json({
        error: 'limit_reached',
        limit,
        hoursUntilReset: hoursLeft,
        isAnonymous: !userId,
      });
    }

    doc.count += 1;
    await doc.save();
    req.coachMessagesLeft = limit - doc.count;
    next();
  } catch (err) {
    console.error('coachRateLimit error:', err.message);
    next(); // fail open — don't block user on rate limit error
  }
};