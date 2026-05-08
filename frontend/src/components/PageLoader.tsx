/**
 * PageLoader — full-screen skeleton shown while lazy pages download.
 *
 * Replaces `fallback={null}` in App.tsx Suspense so users never see
 * a black screen during route transitions. Matches the app's dark
 * background so there's zero flash of white/wrong colour.
 */
export default function PageLoader() {
  return (
    <div
      aria-label="Loading page…"
      role="status"
      style={{
        minHeight: '100vh',
        background: '#010814',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}
    >
      {/* Pulsing orb — matches SoulOrb aesthetic */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #7AC4FF, #3A82F7 70%)',
          boxShadow: '0 0 30px #3A82F744',
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
