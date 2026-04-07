// src/components/AchievementToast.tsx
// Call showAchievements(unlocked) after a session is saved.
import { toast } from 'sonner';

interface Achievement { id: string; icon: string; title: string; desc: string; }

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
          <span style={{ fontSize: 28, lineHeight: 1 }}>{a.icon}</span>
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
      gap: 6, padding: '12px 8px', borderRadius: 14,
      background: earned ? 'rgba(74,158,255,0.08)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${earned ? 'rgba(74,158,255,0.25)' : 'rgba(255,255,255,0.06)'}`,
      opacity: earned ? 1 : 0.4,
      transition: 'all 0.2s',
      cursor: 'default',
      position: 'relative',
    }}>
      <span style={{ fontSize: 26, filter: earned ? 'none' : 'grayscale(1)' }}>
        {achievement.icon}
      </span>
      <span style={{ fontSize: 10, fontWeight: 700, color: earned ? '#B8D9FF' : '#4A7AAA', textAlign: 'center', lineHeight: 1.3 }}>
        {achievement.title}
      </span>
      {earned && earnedAt && (
        <span style={{ fontSize: 9, color: '#2A5080', textAlign: 'center' }}>
          {new Date(earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      )}
      {!earned && (
        <span style={{ fontSize: 9, color: '#2A4060', textAlign: 'center', lineHeight: 1.2 }}>
          {achievement.desc}
        </span>
      )}
    </div>
  );
}
