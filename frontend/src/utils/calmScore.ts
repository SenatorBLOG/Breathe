// src/utils/calmScore.ts

export interface BiometricSnapshot {
  bpm:  number;
  hrv?: number;   // ms, optional
  timestamp: number;
}

export interface SessionBiometrics {
  before:  BiometricSnapshot[];   // readings in first 60s
  during:  BiometricSnapshot[];   // readings mid-session
  after:   BiometricSnapshot[];   // readings in last 60s
  durationMins: number;
}

export interface CalmScoreResult {
  score:          number;         // 0–100
  label:          'minimal' | 'good' | 'great' | 'excellent';
  hrDrop:         number;         // bpm reduction
  hrvGain:        number | null;  // ms improvement
  avgBefore:      number;
  avgAfter:       number;
  recoveryRate:   number;         // bpm/min
  insight:        string;
  techniqueMatch: 'optimal' | 'good' | 'average';
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function calcCalmScore(biometrics: SessionBiometrics): CalmScoreResult {
  const bpmBefore = biometrics.before.map(s => s.bpm);
  const bpmAfter  = biometrics.after.map(s => s.bpm);
  const hrvBefore = biometrics.before.map(s => s.hrv).filter(Boolean) as number[];
  const hrvAfter  = biometrics.after.map(s => s.hrv).filter(Boolean) as number[];

  const avgBefore = avg(bpmBefore) || 75;
  const avgAfter  = avg(bpmAfter)  || 70;
  const hrDrop    = Math.max(0, avgBefore - avgAfter);

  const avgHrvBefore = hrvBefore.length ? avg(hrvBefore) : null;
  const avgHrvAfter  = hrvAfter.length  ? avg(hrvAfter)  : null;
  const hrvGain = avgHrvBefore && avgHrvAfter ? Math.max(0, avgHrvAfter - avgHrvBefore) : null;

  // Recovery rate: how fast HR dropped per minute
  const recoveryRate = biometrics.durationMins > 0 ? hrDrop / biometrics.durationMins : 0;

  // Score calculation (0-100)
  let score = 40; // baseline for completing a session

  // HR drop component (0-35 points)
  if (hrDrop >= 25)      score += 35;
  else if (hrDrop >= 15) score += 25;
  else if (hrDrop >= 8)  score += 15;
  else if (hrDrop >= 3)  score += 8;

  // HRV gain component (0-30 points)
  if (hrvGain !== null) {
    if (hrvGain >= 25)      score += 30;
    else if (hrvGain >= 15) score += 20;
    else if (hrvGain >= 8)  score += 12;
    else if (hrvGain >= 3)  score += 5;
  }

  // Session duration bonus (0-15 points)
  if (biometrics.durationMins >= 15)      score += 15;
  else if (biometrics.durationMins >= 10) score += 10;
  else if (biometrics.durationMins >= 5)  score += 6;
  else                                    score += 2;

  // Starting HR context (higher starting HR = more room to calm = adjusted weight)
  if (avgBefore > 90) score = Math.min(100, score + 5);

  score = Math.min(100, Math.round(score));

  // Label
  const label = score >= 80 ? 'excellent' : score >= 65 ? 'great' : score >= 45 ? 'good' : 'minimal';

  // Technique match
  const techniqueMatch = hrDrop >= 15 && (!hrvGain || hrvGain >= 10)
    ? 'optimal'
    : hrDrop >= 8 ? 'good' : 'average';

  // Insight
  let insight = '';
  if (hrDrop >= 20 && hrvGain && hrvGain >= 15) {
    insight = `Excellent session — your nervous system shifted deeply. HR dropped ${Math.round(hrDrop)} bpm and HRV improved ${Math.round(hrvGain)}ms.`;
  } else if (hrDrop >= 15) {
    insight = `Strong calming response — ${Math.round(hrDrop)} bpm reduction in ${biometrics.durationMins} minutes. Your practice is working.`;
  } else if (hrDrop >= 8) {
    insight = `Good session — moderate calming detected. Longer sessions (10+ min) tend to produce deeper HR drops for most people.`;
  } else if (hrDrop >= 3) {
    insight = `Mild response this session. Try a quieter environment or a slower technique like 4-7-8 to deepen the effect.`;
  } else {
    insight = `Session complete. Biometric data was minimal — ensure your device is snug on your wrist for better readings.`;
  }

  return { score, label, hrDrop: Math.round(hrDrop), hrvGain: hrvGain ? Math.round(hrvGain) : null, avgBefore: Math.round(avgBefore), avgAfter: Math.round(avgAfter), recoveryRate: Math.round(recoveryRate * 10) / 10, insight, techniqueMatch };
}

// ─── Trend analysis over multiple sessions ────────────────────────────────────
export interface BiometricTrend {
  avgCalmScore:    number;
  calmScoreChange: number;    // vs previous week
  bestTechnique:   string | null;
  avgHRDrop:       number;
  totalSessions:   number;
}

export interface StoredCalmSession {
  date:       string;
  score:      number;
  hrDrop:     number;
  hrvGain:    number | null;
  technique:  string;
  durationMins: number;
}

export function analyzeTrend(sessions: StoredCalmSession[]): BiometricTrend {
  if (!sessions.length) return { avgCalmScore: 0, calmScoreChange: 0, bestTechnique: null, avgHRDrop: 0, totalSessions: 0 };

  const now      = Date.now();
  const week1    = sessions.filter(s => now - new Date(s.date).getTime() < 7  * 86400000);
  const week2    = sessions.filter(s => {
    const age = now - new Date(s.date).getTime();
    return age >= 7 * 86400000 && age < 14 * 86400000;
  });

  const avgScore1 = week1.length ? Math.round(avg(week1.map(s => s.score))) : 0;
  const avgScore2 = week2.length ? Math.round(avg(week2.map(s => s.score))) : avgScore1;
  const change    = avgScore1 - avgScore2;

  // Best technique by avg score
  const byTech: Record<string, number[]> = {};
  sessions.forEach(s => {
    if (!byTech[s.technique]) byTech[s.technique] = [];
    byTech[s.technique].push(s.score);
  });
  let bestTechnique: string | null = null;
  let bestAvg = 0;
  Object.entries(byTech).forEach(([tech, scores]) => {
    const a = avg(scores);
    if (a > bestAvg) { bestAvg = a; bestTechnique = tech; }
  });

  return {
    avgCalmScore:    avgScore1 || Math.round(avg(sessions.map(s => s.score))),
    calmScoreChange: change,
    bestTechnique,
    avgHRDrop:       Math.round(avg(sessions.map(s => s.hrDrop))),
    totalSessions:   sessions.length,
  };
}