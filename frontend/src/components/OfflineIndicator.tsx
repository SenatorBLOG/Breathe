import { useEffect, useState } from 'react';

// `navigator.onLine` can be unreliable (some browsers / automation environments
// report `false` even when the network is fine). To avoid showing a misleading
// offline banner, we confirm the offline state with a tiny network probe before
// flipping the UI.
async function probeOnline(): Promise<boolean> {
  try {
    const url = `${window.location.origin}/favicon.ico?_=${Date.now()}`;
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    return res.ok || res.type === 'opaque';
  } catch {
    return false;
  }
}

export default function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const recheck = async () => {
      const online = await probeOnline();
      if (!cancelled) setOffline(!online);
    };

    const on  = () => setOffline(false);
    const off = () => { void recheck(); };

    window.addEventListener('online', on);
    window.addEventListener('offline', off);

    if (!navigator.onLine) void recheck();

    return () => {
      cancelled = true;
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-14 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 t-caption font-medium"
      style={{ background: '#FF9A5C', color: '#010814' }}
    >
      <span aria-hidden>📵</span>
      <span>You're offline — breathing still works</span>
    </div>
  );
}
