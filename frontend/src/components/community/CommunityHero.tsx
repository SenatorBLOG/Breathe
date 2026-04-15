// src/components/community/CommunityHero.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Flame, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api';
import { useThemeStyles } from '../../hooks/useThemeStyles';

interface Stats { members: number; posts: number; activeThisWeek: number; }

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  const ts = useThemeStyles();
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: ts.accent }}>{icon}</span>
      <span className="t-body font-semibold tabular-nums" style={{ color: ts.textSecondary }}>
        {value.toLocaleString()}
      </span>
      <span className="t-caption" style={{ color: ts.textMuted }}>{label}</span>
    </div>
  );
}

export default function CommunityHero({ isLoggedIn, onPost }: {
  isLoggedIn: boolean;
  onPost: () => void;
}) {
  const ts = useThemeStyles();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/community/stats')
      .then(r => setStats(r.data))
      .catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl p-5 border flex flex-col gap-4"
      style={{ background: ts.cardBg, borderColor: ts.border }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-3">
          {stats ? (
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <StatPill icon={<Users size={14} />} value={stats.members} label="practitioners" />
              <StatPill icon={<BookOpen size={14} />} value={stats.posts} label="stories" />
              <StatPill icon={<Flame size={14} />} value={stats.activeThisWeek} label="active this week" />
            </div>
          ) : (
            <div className="flex gap-4">
              {[80, 100, 90].map((w, i) => (
                <div key={i} className="h-4 rounded-full animate-pulse"
                  style={{ width: w, background: ts.border }} />
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {isLoggedIn ? (
            <button
              onClick={onPost}
              className="px-5 py-2.5 rounded-full t-body text-white font-medium tracking-wide transition-all hover:opacity-90 hover:scale-105 active:scale-95"
              style={{ background: ts.btnGradient }}>
              Share your experience
            </button>
          ) : (
            <div className="flex gap-2">
              <Link to="/signup"
                className="px-5 py-2.5 rounded-full t-body text-white font-medium transition-all hover:opacity-90"
                style={{ background: ts.btnGradient }}>
                Create account
              </Link>
              <Link to="/login"
                className="px-5 py-2.5 rounded-full t-body transition-all border"
                style={{ color: ts.textSecondary, borderColor: ts.border }}>
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
