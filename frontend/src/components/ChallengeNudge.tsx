// Floating nudge that occasionally reminds users about challenges.
// Shows once per day, 25s after page load, not on /profile.
import { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { AuthContext } from './contexts/AuthContext';

const MESSAGES = [
  { icon: '🏆', text: 'Ready for a 7-day breathing challenge?', sub: 'Build a lasting habit in one week' },
  { icon: '🔥', text: 'Day streaks keep your calm consistent', sub: 'Start a challenge in your profile' },
  { icon: '⚡', text: 'Earn your first badge this week', sub: '7-day Box Breathing — beginner friendly' },
  { icon: '🌙', text: 'Sleep challenge: 7 nights of 4-7-8', sub: 'Users report falling asleep 40% faster' },
  { icon: '🧘', text: 'Challenge yourself to breathe daily', sub: 'Your profile has 6 challenges waiting' },
];

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const DELAY_MS    = 25_000;               // show after 25s on page
const AUTO_HIDE_MS = 10_000;              // auto-dismiss after 10s

const SKIP_PATHS = ['/profile', '/login', '/signup', '/onboarding'];

export default function ChallengeNudge() {
  const ts = useThemeStyles();
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [msg] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (SKIP_PATHS.some(p => location.pathname.startsWith(p))) return;

    const lastShown = Number(localStorage.getItem('breathe_nudge_at') ?? 0);
    if (Date.now() - lastShown < COOLDOWN_MS) return;

    const show = setTimeout(() => {
      setVisible(true);
      localStorage.setItem('breathe_nudge_at', String(Date.now()));
    }, DELAY_MS);

    return () => clearTimeout(show);
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    if (!visible) return;
    const hide = setTimeout(() => setVisible(false), AUTO_HIDE_MS);
    return () => clearTimeout(hide);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-24 right-4 z-40 w-72 flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-xl"
      style={{
        background: ts.cardBg,
        border: `1px solid ${ts.borderHover}`,
        animation: 'slideUpFade 0.35s ease forwards',
      }}
    >
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <span className="text-2xl flex-shrink-0 mt-0.5">{msg.icon}</span>

      <div className="flex-1 min-w-0">
        <p className="t-caption font-semibold leading-snug" style={{ color: ts.textPrimary }}>
          {msg.text}
        </p>
        <p className="t-label mt-0.5 leading-snug" style={{ color: ts.textMuted }}>
          {msg.sub}
        </p>
        <Link
          to="/profile"
          onClick={() => setVisible(false)}
          className="inline-flex items-center gap-1 mt-2 t-label font-medium px-3 py-1.5 rounded-lg text-white transition-all hover:scale-105"
          style={{ background: ts.btnGradient }}
        >
          View challenges →
        </Link>
      </div>

      <button
        onClick={() => setVisible(false)}
        className="flex-shrink-0 t-caption leading-none mt-0.5 hover:opacity-80 transition-opacity"
        style={{ color: ts.textDim }}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
