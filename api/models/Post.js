// models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 600,
    trim: true,
  },
  category: {
    type: String,
    enum: ['experience', 'question', 'achievement', 'tip'],
    default: 'experience',
  },
  tags: [{
    type: String,
    maxlength: 30,
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // optionally attach a session for context
  sessionRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    default: null,
  },
  reported: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);