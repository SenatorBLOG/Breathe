// middleware/coachRateLimit.js
const mongoose = require('mongoose');

const RateLimitSchema = new mongoose.Schema({
  key:     { type: String, required: true, unique: true },
  count:   { type: Number, default: 0 },
  resetAt: { type: Date,   required: true },
}, { timestamps: false });

const RateLimit = mongoose.models.RateLimit
  || mongoose.model('RateLimit', RateLimitSchema);

const LIMITS = { anonymous: 10, user: 30 };

// Get the real client IP — works behind Railway / Vercel / Nginx proxies
function getRealIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for can be "client, proxy1, proxy2" — take first
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || 'unknown';
}

module.exports = async function coachRateLimit(req, res, next) {
  try {
    const userId = req.user?._id?.toString() ?? null;
    const ip     = getRealIp(req);
    const key    = userId ? `coach:user:${userId}` : `coach:ip:${ip}`;
    const limit  = userId ? LIMITS.user : LIMITS.anonymous;

    const now      = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    let doc = await RateLimit.findOne({ key });

    // Reset if expired
    if (!doc || doc.resetAt <= now) {
      await RateLimit.findOneAndUpdate(
        { key },
        { key, count: 1, resetAt: midnight },
        { upsert: true, returnDocument: 'after' }
      );
      req.coachMessagesLeft = limit - 1;
      return next();
    }

    if (doc.count >= limit) {
      const hoursLeft = Math.ceil((doc.resetAt - now) / 3600000);
      return res.status(429).json({
        error:          'limit_reached',
        limit,
        hoursUntilReset: hoursLeft,
        isAnonymous:    !userId,
      });
    }

    await RateLimit.findOneAndUpdate(
      { key },
      { $inc: { count: 1 } },
      { returnDocument: 'after' }
    );
    req.coachMessagesLeft = limit - doc.count - 1;
    next();
  } catch (err) {
    console.error('coachRateLimit error:', err.message);
    next(); // fail open
  }
};