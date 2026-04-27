// src/pages/LeaderboardPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import api from '../api';
import { useThemeStyles } from '../hooks/useThemeStyles';
import Icon from '../components/Icon';

type TabType = 'time' | 'weekly' | 'streak';

interface Entry {
  rank: number;
  _id: string;
  displayName: string;
  avatar?: string;
  picture?: string;
  totalMins?: number;
  sessions?: number;
  streak?: number;
}

const TABS: { id: TabType; label: string; emoji: string; sub: string }[] = [
  { id: 'time',   label: 'All time',    emoji: '🏆', sub: 'Total practice minutes' },
  { id: 'weekly', label: 'This week',   emoji: '📅', sub: 'Minutes practised this week' },
  { id: 'streak', label: 'Streaks',     emoji: '🔥', sub: 'Current consecutive days' },
];

function fmtMins(m: number) {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return min > 0 ? `${h}h ${min}m` : `${h}h`;
}

function Avatar({ name, src, size = 36 }: { name: string; src?: string | null; size?: number }) {
  const ts = useThemeStyles();
  if (src) return (
    <img src={src} alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: ts.btnGradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.4), fontWeight: 700, color: '#fff',
    }}>
      {name[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const ts = useThemeStyles();
  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
  if (medals[rank]) return <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{medals[rank]}</span>;
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color: ts.textMuted, width: 22, textAlign: 'center', flexShrink: 0 }}>
      #{rank}
    </span>
  );
}

function Skeleton() {
  const ts = useThemeStyles();
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} style={{
          height: 60, borderRadius: 14,
          background: `linear-gradient(90deg, ${ts.cardBg} 25%, ${ts.border} 50%, ${ts.cardBg} 75%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
        }} />
      ))}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

export default function LeaderboardPage() {
  const ts = useThemeStyles();
  const [tab, setTab]       = useState<TabType>('time');
  const [data, setData]     = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/leaderboard?type=${tab}`)
      .then(r => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const current = TABS.find(t => t.id === tab)!;

  return (
    <div className="relative min-h-screen font-montserrat overflow-x-hidden">
      <ThemeBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-6">

          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-light tracking-wide" style={{ color: ts.textPrimary }}>
              🏆 Leaderboard
            </h1>
            <p className="t-caption" style={{ color: ts.textMuted }}>
              Top 50 practitioners worldwide
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 rounded-2xl" style={{ background: ts.cardBg, border: `1px solid ${ts.border}` }}>
            {TABS.map(t => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl t-caption font-medium transition-all"
                  style={{
                    background: active ? ts.btnGradient : 'transparent',
                    color: active ? '#fff' : ts.textMuted,
                    boxShadow: active ? ts.btnShadow : 'none',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = ts.textSecondary; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = ts.textMuted; }}
                >
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-label */}
          <p className="t-label uppercase tracking-widest -mt-2" style={{ color: ts.textDim }}>
            {current.sub}
          </p>

          {/* List */}
          {loading ? <Skeleton /> : data.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center rounded-2xl"
              style={{
                background: ts.cardBg,
                border: `1px dashed ${ts.border}`,
              }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: `${ts.accent}15`, border: `1px solid ${ts.accent}25` }}>
                🌫
              </div>
              <div className="flex flex-col gap-1 max-w-[260px]">
                <p className="t-body font-medium" style={{ color: ts.textPrimary }}>No data yet</p>
                <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
                  Be the first to log a session this week — your name could appear right here.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <style>{`
                @keyframes lbRowIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
              `}</style>
              {data.map((entry, idx) => {
                const isTop3 = entry.rank <= 3;
                return (
                  <div
                    key={entry._id ?? idx}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200"
                    style={{
                      background: isTop3 ? `${ts.accent}0E` : ts.cardBg,
                      border: `1px solid ${isTop3 ? ts.accent + '28' : ts.border}`,
                      boxShadow: isTop3 ? `0 0 18px ${ts.accent}0A` : 'none',
                      animation: `lbRowIn 0.35s ease forwards`,
                      animationDelay: `${Math.min(idx, 12) * 30}ms`,
                      opacity: 0,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateX(2px)';
                      e.currentTarget.style.borderColor = isTop3 ? `${ts.accent}55` : ts.borderHover;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.borderColor = isTop3 ? `${ts.accent}28` : ts.border;
                    }}
                  >
                    <RankBadge rank={entry.rank} />

                    <Avatar
                      name={entry.displayName}
                      src={entry.avatar ?? entry.picture}
                    />

                    <div className="flex-1 min-w-0">
                      <p className="t-body font-medium truncate" style={{ color: ts.textPrimary }}>
                        {entry.displayName}
                      </p>
                      {(tab === 'time' || tab === 'weekly') && entry.sessions != null && (
                        <p className="t-label" style={{ color: ts.textDim }}>
                          {entry.sessions} session{entry.sessions !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0 text-right">
                      {(tab === 'time' || tab === 'weekly') && entry.totalMins != null && (
                        <p className="t-body font-semibold tabular-nums" style={{ color: isTop3 ? ts.accentLight : ts.textSecondary }}>
                          {fmtMins(entry.totalMins)}
                        </p>
                      )}
                      {tab === 'streak' && entry.streak != null && (
                        <p className="t-body font-semibold tabular-nums" style={{ color: isTop3 ? '#FF9A5C' : ts.textSecondary }}>
                          🔥 {entry.streak}d
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 py-4 text-center border-t" style={{ borderColor: `${ts.border}50` }}>
            <p className="t-caption" style={{ color: ts.textMuted }}>
              Practice more to climb the ranks
            </p>
            <Link
              to="/breathing"
              className="px-8 py-3 rounded-xl t-body font-medium text-white transition-all hover:opacity-90"
              style={{ background: ts.btnGradient }}
            >
              <Icon name="1.blow" size={16} className="inline-block mr-1" /> Start a session
            </Link>
          </div>

        </main>

        <Footer />
      </div>
    </div>
  );
}
