// MoodTrackingGrid.tsx
import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import StatCard from './StatCard';

interface Session {
  moodBefore?: number;
  moodAfter?: number;
  mood?: number;
}

const MoodTrackingGrid = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/sessions');
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : [];
        setSessions(data);
      } catch (e) {
        console.error('failed to fetch sessions', e);
        if (mounted) setSessions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const moodStats = useMemo(() => {
    const stats = {
      positive: { count: 0, percentage: 0 },
      neutral: { count: 0, percentage: 0 },
      negative: { count: 0, percentage: 0 },
      total: 0,
    };

    const moodValues = sessions
      .map(s => s.moodAfter ?? s.mood ?? s.moodBefore ?? null)
      .filter((m): m is number => m !== null && m >= 1 && m <= 10);

    stats.total = moodValues.length;

    moodValues.forEach(mood => {
      if (mood >= 8) stats.positive.count++;
      else if (mood >= 4) stats.neutral.count++;
      else stats.negative.count++;
    });

    if (stats.total > 0) {
      stats.positive.percentage = Math.round((stats.positive.count / stats.total) * 100);
      stats.neutral.percentage = Math.round((stats.neutral.count / stats.total) * 100);
      stats.negative.percentage = Math.round((stats.negative.count / stats.total) * 100);
    }

    return stats;
  }, [sessions]);

  const topMood = useMemo(() => {
    const map = new Map<number, number>();
    sessions.forEach(s => {
      const m = s.moodAfter ?? s.mood ?? s.moodBefore;
      if (m && m >= 1 && m <= 10) {
        map.set(m, (map.get(m) || 0) + 1);
      }
    });

    let best = { value: 0, count: 0 };
    map.forEach((count, value) => {
      if (count > best.count) best = { value, count };
    });

    return {
      label: best.value ? `${best.value}/10` : '—',
      count: best.count,
    };
  }, [sessions]);

  const uniqueMoods = useMemo(() => {
    const set = new Set<number>();
    sessions.forEach(s => {
      const m = s.moodAfter ?? s.mood ?? s.moodBefore;
      if (m && m >= 1 && m <= 10) set.add(m);
    });
    return set.size;
  }, [sessions]);

  const cards = [
    { value: loading ? '—' : `${moodStats.positive.percentage}%`, sub: `${moodStats.positive.count} entries`, label: 'Positive (8–10)' },
    { value: loading ? '—' : `${moodStats.neutral.percentage}%`, sub: `${moodStats.neutral.count} entries`, label: 'Neutral (4–7)' },
    { value: loading ? '—' : `${moodStats.negative.percentage}%`, sub: `${moodStats.negative.count} entries`, label: 'Negative (1–3)' },
    { value: loading ? '—' : String(moodStats.total), label: 'Total mood entries' },
    { value: loading ? '—' : topMood.label, sub: topMood.count ? `${topMood.count}×` : undefined, label: 'Most common mood' },
    { value: loading ? '—' : String(uniqueMoods), label: 'Unique mood scores' },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <StatCard key={i} value={c.value} subValue={c.sub} label={c.label} children={undefined} />
        ))}
      </div>
    </div>
  );
};

export default MoodTrackingGrid;