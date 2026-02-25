// server/routes/stats.js
const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// Utility to ensure we always handle empty/undefined values safely
const toMinutes = (value) => {
  const n = Number(value);
  if (Number.isNaN(n) || n < 0) return 0;
  return n;
};

// GET /api/stats/overview
// returns totalSessions, totalMinutes, streak, averageSession
router.get('/overview', async (req, res) => {
  try {
    const sessions = await Session.find().sort({ sessionDate: -1 }).lean();

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((acc, s) => acc + toMinutes(s.sessionLength || 0), 0);
    const averageSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    // compute streak (consecutive days ending today)
    const days = sessions
      .map(s => new Date(s.sessionDate || s.createdAt || Date.now()).setHours(0,0,0,0))
      .sort((a,b) => b - a);

    let streak = 0;
    if (days.length) {
      let expected = new Date().setHours(0,0,0,0);
      for (let d of Array.from(new Set(days))) { // unique days
        if (d === expected) {
          streak++;
          expected = expected - 24*60*60*1000;
        } else if (d < expected) {
          break; // streak broken
        }
      }
    }

    res.json({ totalSessions, totalMinutes, streak, averageSession });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/weekly
// returns array of last 7 days with total minutes per day
router.get('/weekly', async (req, res) => {
  try {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0,0,0,0);
    start.setDate(start.getDate() - 6); // 7-day window: start .. today

    const sessions = await Session.find({ sessionDate: { $gte: start } }).lean();

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    // Build map for last 7 days
    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0,10);

      const minutes = sessions
        .filter(s => new Date(s.sessionDate).toISOString().slice(0,10) === key)
        .reduce((acc, s) => acc + toMinutes(s.sessionLength || 0), 0);

      const sessionCount = sessions.filter(s => new Date(s.sessionDate).toISOString().slice(0,10) === key).length;

      result.push({
        date: key,
        day: dayNames[d.getDay()],
        minutes: Math.round(minutes * 100) / 100,
        sessions: sessionCount,
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/monthly
// returns monthly data for the last 12 months
router.get('/monthly', async (req, res) => {
  try {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth() - 11, 1);

    const sessions = await Session.find({ sessionDate: { $gte: start } }).lean();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const result = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();

      const monthlySessions = sessions.filter(s => {
        const sd = new Date(s.sessionDate);
        return sd.getFullYear() === year && sd.getMonth() === month;
      });

      const minutes = monthlySessions.reduce((acc, s) => acc + toMinutes(s.sessionLength || 0), 0);
      const cycles = monthlySessions.reduce((acc, s) => acc + (Number(s.cycles) || 0), 0);

      result.push({
        month: monthNames[month],
        year,
        minutes: Math.round(minutes * 100) / 100,
        sessions: monthlySessions.length,
        cycles,
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/mood
// returns mood distribution inferred from moodBefore/moodAfter
router.get('/mood', async (req, res) => {
  try {
    const sessions = await Session.find({
      moodBefore: { $exists: true },
      moodAfter: { $exists: true },
    }).lean();

    let positive = 0, neutral = 0, negative = 0;

    sessions.forEach(s => {
      const before = Number(s.moodBefore) || 0;
      const after = Number(s.moodAfter) || 0;
      if (after > before) positive++;
      else if (after < before) negative++;
      else neutral++;
    });

    const total = positive + neutral + negative;

    res.json({
      positive: { count: positive, percentage: total > 0 ? Math.round((positive / total) * 100) : 0 },
      neutral: { count: neutral, percentage: total > 0 ? Math.round((neutral / total) * 100) : 0 },
      negative: { count: negative, percentage: total > 0 ? Math.round((negative / total) * 100) : 0 },
      total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/sessions-breakdown
// returns session data breakdown by duration ranges
router.get('/sessions-breakdown', async (req, res) => {
  try {
    const sessions = await Session.find().lean();

    const breakdown = {
      short: 0,     // 0-5 minutes
      medium: 0,    // 5-15 minutes
      long: 0,      // 15-30 minutes
      extended: 0   // 30+ minutes
    };

    sessions.forEach(session => {
      const minutes = toMinutes(session.sessionLength || 0);
      if (minutes <= 5) breakdown.short++;
      else if (minutes <= 15) breakdown.medium++;
      else if (minutes <= 30) breakdown.long++;
      else breakdown.extended++;
    });

    const total = sessions.length;

    res.json([
      { name: 'Short (0-5min)', value: breakdown.short, percentage: total > 0 ? Math.round((breakdown.short / total) * 100) : 0 },
      { name: 'Medium (5-15min)', value: breakdown.medium, percentage: total > 0 ? Math.round((breakdown.medium / total) * 100) : 0 },
      { name: 'Long (15-30min)', value: breakdown.long, percentage: total > 0 ? Math.round((breakdown.long / total) * 100) : 0 },
      { name: 'Extended (30min+)', value: breakdown.extended, percentage: total > 0 ? Math.round((breakdown.extended / total) * 100) : 0 }
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/progress
// returns progress data showing improvement over time
router.get('/progress', async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const sessions = await Session.find({ sessionDate: { $gte: sixMonthsAgo } }).lean();

    // group by year-month
    const map = new Map();
    sessions.forEach(s => {
      const d = new Date(s.sessionDate);
      const key = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
      const minutes = toMinutes(s.sessionLength || 0);
      if (!map.has(key)) map.set(key, { totalMinutes: 0, sessionCount: 0 });
      const entry = map.get(key);
      entry.totalMinutes += minutes;
      entry.sessionCount += 1;
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const result = Array.from(map.entries())
      .sort((a,b) => a[0].localeCompare(b[0]))
      .map(([key, data]) => {
        const [year, month] = key.split('-').map(Number);
        return {
          month: monthNames[month - 1],
          year,
          avgSessionLength: data.sessionCount ? Math.round((data.totalMinutes / data.sessionCount) * 10) / 10 : 0,
          totalMinutes: Math.round(data.totalMinutes * 100) / 100,
          sessionCount: data.sessionCount
        };
      });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
