// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from './App';
import './i18n';
import './theme.css'; // must be imported before App
import './index.css';
import './styles/globals.css';

// Build identification — surfaced in console + window so bug reports and
// support tickets can be tied back to a specific commit.
const BUILD = { commit: __COMMIT__, builtAt: __BUILD_TIME__ };
(window as any).__breatheBuild = BUILD;
// eslint-disable-next-line no-console
console.info(`%cBreathe%c build ${BUILD.commit} · ${BUILD.builtAt}`,
  'background:#3A82F7;color:white;padding:2px 6px;border-radius:4px;font-weight:bold',
  'color:#888');

// Disable React DevTools attach in production builds — reduces information
// leakage and shaves a small amount of runtime overhead. Dev builds keep
// DevTools so local debugging still works.
if (import.meta.env.PROD && typeof (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
  const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  for (const prop of Object.keys(hook)) {
    if (prop === 'renderers') hook[prop] = new Map();
    else if (typeof hook[prop] === 'function') hook[prop] = () => {};
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <SpeedInsights />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => { /* SW registered — no console noise in production */ })
      .catch(() => { /* SW unavailable — app still works without it */ });
  });
}