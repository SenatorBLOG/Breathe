// src/components/AchievementToast.tsx
// Call showAchievements(unlocked) after a session is saved.
import React from 'react';
import { toast } from 'sonner';

interface Achievement { id: string; icon: React.ReactNode; title: string; desc: string; }

export function showAchievements(list: Achievement[]) {
  list.forEach((a, i) => {
    setTimeout(() => {
      toast.custom(() => (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px', borderRadius: 16,
          background: 'linear-gradient(135deg,#0B1628,#0F2040)',
          border: '1px solid rgba(74,158,255,0.35)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          minWidth: 260,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}>{a.icon}</span>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#B8D9FF' }}>
              Achievement unlocked!
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 14, color: '#E0F0FF', fontWeight: 600 }}>
              {a.title}
            </p>
            <p style={{ margin: '1px 0 0', fontSize: 11, color: '#4A7AAA' }}>
              {a.desc}
            </p>
          </div>
        </div>
      ), { duration: 4000 });
    }, i * 800);
  });
}

// ── Badge component for ProfilePage display ───────────────────────────────────
export function AchievementBadge({ achievement, earned, earnedAt }: {
  achievement: Achievement;
  earned: boolean;
  earnedAt?: string;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 4, padding: '10px 6px', borderRadius: 14,
      background: earned ? 'rgba(74,158,255,0.10)' : 'transparent',
      border: `1px solid ${earned ? 'rgba(74,158,255,0.28)' : 'rgba(255,255,255,0.07)'}`,
      opacity: earned ? 1 : 0.35,
      transition: 'all 0.2s',
      cursor: 'default',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, filter: earned ? 'none' : 'grayscale(1) brightness(0.6)', opacity: earned ? 1 : 0.5 }}>
        {achievement.icon}
      </span>
      <span style={{ fontSize: 10, fontWeight: 600, color: earned ? '#C8E4FF' : '#3A5A7A', textAlign: 'center', lineHeight: 1.2 }}>
        {achievement.title}
      </span>
      {earned && earnedAt && (
        <span style={{ fontSize: 9, color: '#4A8AAA', textAlign: 'center' }}>
          {new Date(earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      )}
    </div>
  );
}
