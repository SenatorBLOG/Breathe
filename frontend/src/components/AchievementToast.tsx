// src/components/AchievementToast.tsx
// Call showAchievements(unlocked) after a session is saved.
import React from 'react';
import { toast } from 'sonner';
import { THEME_STYLES } from '../hooks/useThemeStyles';

interface Achievement { id: string; icon: React.ReactNode; title: string; desc: string; }

export function showAchievements(list: Achievement[], theme: 'night' | 'day' | 'nature' = 'night') {
  const ts = THEME_STYLES[theme];
  list.forEach((a, i) => {
    setTimeout(() => {
      toast.custom(() => (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px', borderRadius: 16,
          background: ts.cardBgHover,
          border: `1px solid ${ts.borderHover}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          minWidth: 260,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}>{a.icon}</span>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: ts.textMuted }}>
              Achievement unlocked!
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 14, color: ts.textPrimary, fontWeight: 600 }}>
              {a.title}
            </p>
            <p style={{ margin: '1px 0 0', fontSize: 11, color: ts.textDim }}>
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
      border: `1px solid ${earned ? 'rgba(74,158,255,0.28)' : 'rgba(128,128,128,0.15)'}`,
      opacity: earned ? 1 : 0.35,
      transition: 'all 0.2s',
      cursor: 'default',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, filter: earned ? 'none' : 'grayscale(1) brightness(0.6)', opacity: earned ? 1 : 0.5 }}>
        {achievement.icon}
      </span>
      <span style={{ fontSize: 10, fontWeight: 600, color: earned ? '#C8E4FF' : 'rgba(128,128,128,0.5)', textAlign: 'center', lineHeight: 1.2 }}>
        {achievement.title}
      </span>
      {earned && earnedAt && (
        <span style={{ fontSize: 9, color: 'rgba(128,128,128,0.6)', textAlign: 'center' }}>
          {new Date(earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      )}
    </div>
  );
}
