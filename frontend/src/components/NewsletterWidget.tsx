// src/components/NewsletterWidget.tsx
import React, { useState } from 'react';
import api from '../api';

export default function NewsletterWidget() {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
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
    <div className="bg-[#0B1628]/70 border border-[#1E3358]/50 rounded-2xl p-4 flex flex-col gap-3">
      <h3 className="text-xs uppercase tracking-widest text-[#3D6080]">Weekly Calm</h3>
      <p className="text-[#4A7AAA] text-xs leading-relaxed">
        Get one mindfulness tip delivered every Sunday.
      </p>

      {status === 'success' ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#4AE8A0]/10 border border-[#4AE8A0]/20">
          <span className="text-sm">🌊</span>
          <span className="text-[#4AE8A0] text-xs">{message}</span>
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
            className="flex-1 min-w-0 bg-[#060C1A] border border-[#1E3358]/60 rounded-lg px-3 py-2 text-xs text-[#7AADCC] placeholder-[#2A4060] outline-none focus:border-[#2A5499] transition-colors disabled:opacity-50"
          />
          <button
            onClick={subscribe}
            disabled={status === 'loading' || !email.includes('@')}
            className="px-3 py-2 bg-[#1A5FCC] rounded-lg text-xs text-white hover:bg-[#2266D4] transition-colors flex-shrink-0 disabled:opacity-40"
          >
            {status === 'loading' ? '…' : '→'}
          </button>
        </div>
      )}

      {status === 'error' && (
        <p className="text-[#FF8A8A] text-[10px]">{message}</p>
      )}
    </div>
  );
}