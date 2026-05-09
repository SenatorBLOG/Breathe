/**
 * PageLoader — full-screen skeleton shown while lazy pages download.
 *
 * Reads the persisted theme from localStorage so the background colour
 * matches the user's theme before React has hydrated. Prevents a jarring
 * black flash on the Celestial (day) or Nature themes.
*/
import { useTranslation } from 'react-i18next';

const THEME_BG: Record<string, string> = {
  night:  '#010814',
  day:    '#F5F0E8',
  nature: '#0A1A0E',
};

const THEME_ORB: Record<string, [string, string]> = {
  // [core, edge]
  night:  ['#7AC4FF', '#3A82F7'],
  day:    ['#E8C060', '#9E6800'],
  nature: ['#4AE8A0', '#2ECC71'],
};

function getTheme(): string {
  try { return localStorage.getItem('breathe_theme') ?? 'night'; } catch { return 'night'; }
}

export default function PageLoader() {
  const { t } = useTranslation();
  const theme = getTheme();
  const bg = THEME_BG[theme] ?? THEME_BG.night;
  const [core, edge] = THEME_ORB[theme] ?? THEME_ORB.night;

  return (
    <div
      aria-label={t('common.loadingPage')}
      role="status"
      style={{
        minHeight: '100vh',
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        transition: 'background 0.3s',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${core}, ${edge} 70%)`,
          boxShadow: `0 0 30px ${edge}44`,
          animation: 'pageloader-pulse 1.6s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes pageloader-pulse {
          0%, 100% { transform: scale(1);    opacity: 0.9; }
          50%       { transform: scale(1.12); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
