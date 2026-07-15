const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionDate: { type: Date, default: Date.now },
  moodBefore: { type: Number, default: null },
  moodAfter: { type: Number, default: null },
  focusLevel: { type: Number, default: null },
  stressLevel: { type: Number, default: null },
  breathingDepth: { type: Number, default: null },
  calmnessScore: { type: Number, default: null },
  distractionCount: { type: Number, default: 0 },
  timeOfDay: { type: String, default: '' },
  noiseLevel: { type: String, default: '' },
  sessionLength: { type: Number, default: 0 }, // minutes
  cycles: { type: Number, default: 0 },
  notes: { type: String, default: '', maxlength: 2000 },
  nlp: {
    sentiment:          { type: String, enum: ['positive', 'neutral', 'negative'], default: null },
    score:              { type: Number, min: -1, max: 1, default: null },
    themes:             [{ type: String }],
    intensity:          { type: Number, min: 1, max: 10, default: null },
    suggestedTechnique: { type: String, default: null },
    oneLineSummary:     { type: String, default: null },
    analyzedAt:         { type: Date, default: null },
  },
  // ML Recommendation fields
  mlRecommendation: {
    recommendedTechnique: { type: String, enum: ['breathing', 'sleep', 'focus', 'relaxation'], default: null },
    confidence: { type: Number, min: 0, max: 1, default: null },
    probabilities: { type: Map, of: Number, default: {} },
    modelVersion: { type: String, default: null },
  },
  userChoice: { type: String, enum: ['breathing', 'sleep', 'focus', 'relaxation'], default: null },
  rating: { type: Number, min: 1, max: 5, default: null },
  usedForTraining: { type: Boolean, default: false },
});

module.exports = mongoose.model('Session', sessionSchema);
