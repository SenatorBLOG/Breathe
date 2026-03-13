// middleware/optionalAuth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Like auth middleware but NEVER returns 401.
 * If a valid token is present → sets req.user.
 * If no token or invalid token → sets req.user = null and continues.
 */
module.exports = async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id ?? decoded._id).select('-password');
    req.user = user ?? null;
  } catch {
    // expired / invalid token — still let the request through
    req.user = null;
  }
  next();
};