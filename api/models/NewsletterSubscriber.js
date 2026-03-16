// models/NewsletterSubscriber.js
const mongoose = require('mongoose');

const NewsletterSubscriberSchema = new mongoose.Schema({
  email:       { type: String, required: true, unique: true, trim: true, lowercase: true },
  subscribedAt:{ type: Date, default: Date.now },
  active:      { type: Boolean, default: true },
  unsubToken:  { type: String, required: true }, // unique token for one-click unsub
}, { timestamps: false });

module.exports = mongoose.model('NewsletterSubscriber', NewsletterSubscriberSchema);