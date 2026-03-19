const mongoose = require('mongoose');

const GlobePinSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  username:    { type: String, default: 'Anonymous' },
  lat:         { type: Number, required: true, min: -90,  max: 90  },
  lng:         { type: Number, required: true, min: -180, max: 180 },
  city:        { type: String, default: '' },
  country:     { type: String, default: '' },
  title:       { type: String, maxlength: 80,  default: 'Meditation spot' },
  note:        { type: String, maxlength: 300, default: '' },
  technique:   { type: String, enum: ['box', '4-7-8', 'wim-hof', 'coherent', 'belly', 'alternate', 'other'], default: 'other' },
  sessionLink: { type: String, default: '' },
  likeCount:   { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now },
});
GlobePinSchema.index({ lat: 1, lng: 1 });
module.exports = mongoose.model('GlobePin', GlobePinSchema);
