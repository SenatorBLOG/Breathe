// services/achievementService.js
// Checks which achievements a user just unlocked and persists them.
const Session = require('../models/Session');
const User    = require('../models/User');

const ACHIEVEMENTS = [
  { id: 'first_breath',   icon: '/icons/1.blow.webp', title: 'First Breath',    desc: 'Complete your first session' },
  { id: 'sessions_5',     icon: '⭐', title: 'Getting Started',  desc: '5 sessions completed' },
  { id: 'sessions_10',    icon: '🎯', title: 'Dedicated',        desc: '10 sessions completed' },
  { id: 'sessions_50',    icon: '💪', title: 'Committed',        desc: '50 sessions completed' },
  { id: 'sessions_100',   icon: '💯', title: 'Century',          desc: '100 sessions completed' },
  { id: 'streak_3',       icon: '🔥', title: 'Warming Up',       desc: '3-day streak' },
  { id: 'streak_7',       icon: '⚡', title: 'Week Warrior',     desc: '7-day streak' },
  { id: 'streak_30',      icon: '🌟', title: 'Monthly Master',   desc: '30-day streak' },
  { id: 'long_session',   icon: '🌊', title: 'Deep Diver',       desc: 'A session lasting 20+ minutes' },
  { id: 'early_bird',     icon: '🌅', title: 'Early Bird',       desc: 'Session before 7 AM' },
  { id: 'night_owl',      icon: '🦉', title: 'Night Owl',        desc: 'Session after 11 PM' },
  { id: 'mood_boost',     icon: '😊', title: 'Mood Boost',       desc: 'Mood improved by 3+ points after a session' },
];

module.exports.ACHIEVEMENTS = ACHIEVEMENTS;

// Returns array of newly unlocked achievement ids
async function checkAchievements(userId, newSession) {
  try {
    const user     = await User.findById(userId).select('achievements').lean();
    const earned   = new Set((user?.achievements ?? []).map(a => a.id));
    const sessions = await Session.find({ userId }).sort({ sessionDate: -1 }).lean();
    const total    = sessions.length;

    const newlyUnlocked = [];

    const earn = (id) => {
      if (!earned.has(id)) { newlyUnlocked.push(id); earned.add(id); }
    };

    // Count-based
    if (total >= 1)   earn('first_breath');
    if (total >= 5)   earn('sessions_5');
    if (total >= 10)  earn('sessions_10');
    if (total >= 50)  earn('sessions_50');
    if (total >= 100) earn('sessions_100');

    // Long session
    if ((newSession.sessionLength ?? 0) >= 20) earn('long_session');

    // Time of day
    const hour = new Date(newSession.sessionDate ?? Date.now()).getHours();
    if (hour < 7)  earn('early_bird');
    if (hour >= 23) earn('night_owl');

    // Mood boost
    const before = newSession.moodBefore ?? 0;
    const after  = newSession.moodAfter  ?? 0;
    if (after - before >= 3) earn('mood_boost');

    // Streak check
    const dates = [...new Set(sessions.map(s => new Date(s.sessionDate).toDateString()))];
    const streak = calcStreak(dates);
    if (streak >= 3)  earn('streak_3');
    if (streak >= 7)  earn('streak_7');
    if (streak >= 30) earn('streak_30');

    // Persist newly unlocked
    if (newlyUnlocked.length > 0) {
      const now = new Date();
      await User.updateOne(
        { _id: userId },
        { $push: { achievements: { $each: newlyUnlocked.map(id => ({ id, unlockedAt: now })) } } }
      );
    }

    return newlyUnlocked.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean);
  } catch (err) {
    console.error('Achievement check error:', err.message);
    return [];
  }
}

function calcStreak(dateStrings) {
  if (!dateStrings.length) return 0;
  const today = new Date().toDateString();
  if (!dateStrings.includes(today)) return 0;
  let streak = 1;
  const cur = new Date();
  cur.setDate(cur.getDate() - 1);
  while (dateStrings.includes(cur.toDateString())) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

module.exports.checkAchievements = checkAchievements;
