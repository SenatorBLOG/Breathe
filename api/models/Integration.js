// models/Integration.js
const mongoose = require('mongoose');

const IntegrationSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider:     { type: String, enum: ['fitbit', 'google_fit', 'apple_health'], required: true },
  accessToken:  { type: String, required: true },
  refreshToken: { type: String },
  expiresAt:    { type: Date },
  scope:        { type: String },
  lastSyncAt:   { type: Date },
  data: {
    sleep:    { type: mongoose.Schema.Types.Mixed, default: null },
    hrv:      { type: mongoose.Schema.Types.Mixed, default: null },
    heartRate:{ type: mongoose.Schema.Types.Mixed, default: null },
  },
}, { timestamps: true });

// One integration per user per provider
IntegrationSchema.index({ userId: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Integration', IntegrationSchema);