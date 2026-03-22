// models/UserChallenge.js
const mongoose = require('mongoose');

const userChallengeSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },
  challengeId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  startedAt:     { type: Date, default: Date.now },
  completedDays: [{ type: Date }],
  completedAt:   { type: Date, default: null },
  abandoned:     { type: Boolean, default: false },
  badge:         {
    emoji:    String,
    label:    String,
    earnedAt: Date,
  },
});

module.exports = mongoose.model('UserChallenge', userChallengeSchema);
