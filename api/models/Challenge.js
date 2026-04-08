// models/Challenge.js
const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  slug:          { type: String, required: true, unique: true },
  title:         { type: String, required: true },
  subtitle:      { type: String, default: '' },
  icon:          { type: String, default: '/icons/1.blow.webp' },
  duration:      { type: Number, required: true },
  technique:     { type: String, default: '' },
  preset:        { inhale: Number, hold: Number, exhale: Number, pause: Number },
  minMinutes:    { type: Number, default: 3 },
  difficulty:    { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  tags:          [String],
  badge:         { emoji: String, label: String },
  baseJoinCount: { type: Number, default: 0 },  // seed baseline so it doesn't start at 0
});

const SEED_DATA = [
  {
    slug: 'box-7', icon: '📦', duration: 7, technique: 'box',
    title: 'Box Breathing — 7 Days',
    subtitle: 'Build focus and calm in one week',
    preset: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
    minMinutes: 3, difficulty: 'beginner',
    tags: ['focus', 'stress', 'beginner'],
    badge: { emoji: '🥉', label: 'Box Breather' },
    baseJoinCount: 1284,
  },
  {
    slug: 'morning-7', icon: '🌅', duration: 7, technique: 'coherent',
    title: 'Morning Ritual — 7 Days',
    subtitle: 'Start every day with intention and energy',
    preset: { inhale: 5, hold: 0, exhale: 5, pause: 1 },
    minMinutes: 3, difficulty: 'beginner',
    tags: ['energy', 'focus', 'morning'],
    badge: { emoji: '🌅', label: 'Early Riser' },
    baseJoinCount: 874,
  },
  {
    slug: 'sleep-7', icon: '🌙', duration: 7, technique: '4-7-8',
    title: 'Sleep Reset — 7 Days',
    subtitle: 'Rewire your bedtime routine for deep rest',
    preset: { inhale: 4, hold: 7, exhale: 8, pause: 0 },
    minMinutes: 3, difficulty: 'beginner',
    tags: ['sleep', 'anxiety', 'beginner'],
    badge: { emoji: '🌙', label: 'Deep Sleeper' },
    baseJoinCount: 1051,
  },
  {
    slug: 'box-21', icon: '📦', duration: 21, technique: 'box',
    title: 'Box Breathing — 21 Days',
    subtitle: 'Lock in the focus habit permanently',
    preset: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
    minMinutes: 5, difficulty: 'intermediate',
    tags: ['focus', 'stress', 'intermediate'],
    badge: { emoji: '🥇', label: 'Box Master' },
    baseJoinCount: 537,
  },
  {
    slug: 'anxiety-21', icon: '🧘', duration: 21, technique: '4-7-8',
    title: 'Anxiety Buster — 21 Days',
    subtitle: 'Rewire your stress response at the root',
    preset: { inhale: 4, hold: 7, exhale: 8, pause: 0 },
    minMinutes: 5, difficulty: 'intermediate',
    tags: ['anxiety', 'stress', 'sleep'],
    badge: { emoji: '🧘', label: 'Calm Mind' },
    baseJoinCount: 692,
  },
  {
    slug: 'energy-21', icon: '⚡', duration: 21, technique: 'wim-hof',
    title: 'Energy Boost — 21 Days',
    subtitle: 'Supercharge your body with oxygen and fire',
    preset: { inhale: 2, hold: 0, exhale: 2, pause: 0 },
    minMinutes: 5, difficulty: 'advanced',
    tags: ['energy', 'focus', 'advanced'],
    badge: { emoji: '⚡', label: 'Energizer' },
    baseJoinCount: 348,
  },
];

challengeSchema.statics.seedAll = async function () {
  for (const ch of SEED_DATA) {
    await this.updateOne({ slug: ch.slug }, { $set: ch }, { upsert: true });
  }
  console.log('✅ Challenges seeded');
};

module.exports = mongoose.model('Challenge', challengeSchema);
