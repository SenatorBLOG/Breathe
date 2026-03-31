//server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: function () {
        return this.authType === 'password';
      },
      minlength: 6,
    },
    name: { type: String },     // <--- Add this
    picture: { type: String },
    authType: {
      type: String,
      enum: ['password', 'google'],
      default: 'password'
    },
    googleId: { type: String, unique: true, sparse: true },

    // Profile
    nickname: { type: String, trim: true, maxlength: 30 },
    avatar:   { type: String }, // user-uploaded photo (base64 or URL)
    bodyProfile: {
      heightCm: { type: Number, min: 50,  max: 300 },
      weightKg: { type: Number, min: 20,  max: 500 },
      age:      { type: Number, min: 1,   max: 120 },
      gender:   { type: String, enum: ['male', 'female', 'other', 'prefer_not'] },
      goal:     { type: String, enum: ['sleep', 'stress', 'focus', 'energy', 'general'] },
    },

    // Blocked users
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Email retention
    lastSessionAt:     { type: Date },
    reminderEmailSent: { type: Date, default: null },
    unsubscribedAt:    { type: Date },
    emailPreferences: {
      reminder: { type: Boolean, default: true },
      weekly:   { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare candidate password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
