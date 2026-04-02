// src/components/NewsletterWidget.tsx
import React, { useState } from 'react';
import api from '../api';
import { useThemeStyles } from '../hooks/useThemeStyles';

export default function NewsletterWidget() {
  const ts = useThemeStyles();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const subscribe = async () => {
    if (!email.includes('@')) return;
    setStatus('loading');
    try {
      const { data } = await api.post('/newsletter/subscribe', { email });
      setStatus('success');
      setMessage(data.message ?? 'Subscribed!');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error ?? 'Something went wrong');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <>
      <style>{`
        .newsletter-input::placeholder {
          color: ${ts.textDim};
          opacity: 1;
        }
        .newsletter-input::-webkit-input-placeholder { color: ${ts.textDim}; }
        .newsletter-input::-moz-placeholder          { color: ${ts.textDim}; }
        .newsletter-input:-ms-input-placeholder      { color: ${ts.textDim}; }
      `}</style>

      <div className="rounded-2xl p-4 flex flex-col gap-3"
        style={{
          backgroundColor: ts.cardBg,
          border: `1px solid ${ts.border}`,
        }}
      >
        <h3 className="t-caption uppercase tracking-widest" style={{ color: ts.textDim }}>
          Weekly Calm
        </h3>
        <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
          Get one mindfulness tip delivered every Sunday.
        </p>

        {status === 'success' ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              backgroundColor: `${ts.accent}10`,
              border: `1px solid ${ts.accent}20`,
            }}
          >
            <span className="t-body">🌊</span>
            <span className="t-caption" style={{ color: ts.accent }}>
              {message}
            </span>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && subscribe()}
              placeholder="your@email.com"
              disabled={status === 'loading'}
              className="newsletter-input flex-1 min-w-0 rounded-lg px-3 py-2 t-caption outline-none transition-colors disabled:opacity-50"
              style={{
                backgroundColor: ts.cardBg,
                border: `1px solid ${ts.border}`,
                color: ts.textSecondary,
              }}
            />
            <button
              onClick={subscribe}
              disabled={status === 'loading' || !email.includes('@')}
              className="px-3 py-2 rounded-lg t-caption text-white transition-colors flex-shrink-0 disabled:opacity-40"
              style={{ background: ts.btnGradient }}
            >
              {status === 'loading' ? '…' : '→'}
            </button>
          </div>
        )}

        {status === 'error' && (
          <p className="t-label" style={{ color: '#FF8A8A' }}>
            {message}
          </p>
        )}
      </div>
    </>
  );
}