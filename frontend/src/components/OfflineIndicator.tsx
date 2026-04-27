import { useEffect, useState } from 'react';

export default function OfflineIndicator() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes offlineSlideIn { from { transform: translateY(-100%); } to { transform: translateY(0); } }
      `}</style>
      <div
        role="status"
        aria-live="polite"
        className="fixed top-14 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 t-caption font-medium"
        style={{
          background: 'linear-gradient(135deg, #FF9A5C, #F97316)',
          color: '#0A0A0E',
          boxShadow: '0 4px 20px rgba(249,115,22,0.25)',
          animation: offline ? 'offlineSlideIn 0.32s cubic-bezier(0.22,1,0.36,1)' : undefined,
          transform: offline ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.28s ease',
          pointerEvents: offline ? 'auto' : 'none',
        }}
      >
        <span aria-hidden>📵</span>
        <span>You're offline — breathing still works</span>
      </div>
    </>
  );
}
