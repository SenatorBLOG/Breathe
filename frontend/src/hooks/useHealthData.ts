// src/hooks/useHealthData.ts
import { useEffect, useState } from 'react';
import api from '../api';

export interface DailySleep {
  date:        string;
  duration:    number;  // minutes
  efficiency?: number;
  score?:      number;
  deepMins?:   number;
  remMins?:    number;
}

export interface DailyHRV {
  date:  string;
  rmssd: number | null;
}

export interface DailyHR {
  date:        string;
  restingRate?: number | null;
  avgRate?:     number | null;
}

export interface HealthData {
  sleep:     DailySleep[];
  hrv:       DailyHRV[];
  heartRate: DailyHR[];
  // derived
  lastSleep:      DailySleep | null;
  avgSleep7d:     number | null;   // minutes
  avgHRV7d:       number | null;   // ms
  restingHR:      number | null;   // bpm
  sleepQuality:   'good' | 'fair' | 'poor' | null;
  recoveryScore:  number | null;   // 0-100 composite
  sources:        string[];        // which providers contributed
}

const EMPTY: HealthData = {
  sleep: [], hrv: [], heartRate: [],
  lastSleep: null, avgSleep7d: null, avgHRV7d: null, restingHR: null,
  sleepQuality: null, recoveryScore: null, sources: [],
};

function computeRecovery(avgHRV: number | null, avgSleep: number | null, sleepEff?: number): number | null {
  if (!avgHRV && !avgSleep) return null;
  let score = 50;
  if (avgSleep) {
    if (avgSleep >= 450) score += 25;       // 7.5h+
    else if (avgSleep >= 360) score += 15;   // 6h+
    else score -= 10;
  }
  if (avgHRV) {
    if (avgHRV >= 60) score += 25;
    else if (avgHRV >= 40) score += 15;
    else score -= 5;
  }
  if (sleepEff) score += (sleepEff - 80) * 0.5;
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function useHealthData(): { data: HealthData; loading: boolean } {
  const [data,    setData]    = useState<HealthData>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    api.get('/integrations/status')
      .then(res => {
        const integrations: any[] = res.data ?? [];
        if (!integrations.length) { setLoading(false); return; }

        // Merge data from all providers
        const allSleep:     DailySleep[] = [];
        const allHRV:       DailyHRV[]   = [];
        const allHR:        DailyHR[]    = [];
        const sources:      string[]     = [];

        integrations.forEach(integ => {
          if (!integ.data) return;
          sources.push(integ.provider);
          if (Array.isArray(integ.data.sleep) && integ.data.sleep.length)
            allSleep.push(...integ.data.sleep);

          if (Array.isArray(integ.data.hrv) && integ.data.hrv.length) {
            // Normalize: different providers use different field names for HRV value
            const normalized: DailyHRV[] = integ.data.hrv.map((e: any) => ({
              // Date: try 'date', 'dateTime', 'startDate' (ISO string → take first 10 chars)
              date: (e.date ?? e.dateTime ?? e.startDate ?? '').slice(0, 10),
              // Value: try rmssd, value, sdnn, hrv (all common field names)
              rmssd: e.rmssd ?? e.value ?? e.sdnn ?? e.hrv ?? null,
            })).filter((e: DailyHRV) => e.date && e.rmssd !== null);
            allHRV.push(...normalized);
          }

          if (Array.isArray(integ.data.heartRate) && integ.data.heartRate.length)
            allHR.push(...integ.data.heartRate);
        });

        // Deduplicate by date (prefer fitbit over others)
        const dedup = <T extends { date: string }>(arr: T[]): T[] => {
          const map = new Map<string, T>();
          arr.forEach(item => { if (!map.has(item.date)) map.set(item.date, item); });
          return Array.from(map.values()).sort((a,b) => a.date.localeCompare(b.date));
        };

        const sleep     = dedup(allSleep);
        const hrv       = dedup(allHRV);
        const heartRate = dedup(allHR);

        // Last 7 days
        const last7 = (arr: any[]) => arr.slice(-7);
        const s7 = last7(sleep);
        const h7 = last7(hrv).filter((d: DailyHRV) => d.rmssd);

        const avgSleep7d = s7.length
          ? Math.round(s7.reduce((s: number, d: DailySleep) => s + d.duration, 0) / s7.length)
          : null;
        const avgHRV7d = h7.length
          ? Math.round(h7.reduce((s: number, d: DailyHRV) => s + (d.rmssd ?? 0), 0) / h7.length)
          : null;
        const restingHR = heartRate.length
          ? (heartRate[heartRate.length - 1]?.restingRate ?? heartRate[heartRate.length - 1]?.avgRate ?? null)
          : null;
        const lastSleep = sleep[sleep.length - 1] ?? null;
        const sleepQuality: HealthData['sleepQuality'] = avgSleep7d
          ? avgSleep7d >= 420 ? 'good' : avgSleep7d >= 300 ? 'fair' : 'poor'
          : null;
        const recoveryScore = computeRecovery(avgHRV7d, avgSleep7d, lastSleep?.efficiency);

        setData({ sleep, hrv, heartRate, lastSleep, avgSleep7d, avgHRV7d,
          restingHR: restingHR ? Math.round(restingHR) : null,
          sleepQuality, recoveryScore, sources });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}