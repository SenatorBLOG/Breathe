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

  if (!offline) return null;

  return (
    <div
      className="fixed top-14 left-0 right-0 z-50 flex items-center justify-center py-2 t-caption font-medium"
      style={{ background: '#FF9A5C', color: '#010814' }}
    >
      📵 You're offline — breathing still works
    </div>
  );
}
