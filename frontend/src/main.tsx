// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from './App';
import './i18n';
import './theme.css'; // must be imported before App
import './index.css';
import './styles/globals.css';

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