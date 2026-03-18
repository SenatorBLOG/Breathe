// src/components/HeartRateMonitor.tsx
import { useEffect, useRef } from 'react';
import { useHeartRate } from '../hooks/useHeartRate';
import { useThemeStyles } from '../hooks/useThemeStyles';

// ─── Animated heart SVG ───────────────────────────────────────────────────────
function HeartIcon({ bpm, active }: { bpm: number | null; active: boolean }) {
  const interval = bpm ? 60000 / bpm : 1000;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 48, height: 48 }}>
      <style>{`
        @keyframes heartbeat {
          0%   { transform: scale(1); }
          15%  { transform: scale(1.25); }
          30%  { transform: scale(1); }
          45%  { transform: scale(1.18); }
          60%  { transform: scale(1); }
          100% { transform: scale(1); }
        }
        .heart-beat { animation: heartbeat ${interval}ms ease-in-out infinite; }
        .heart-idle { animation: heartbeat 1200ms ease-in-out infinite; }
      `}</style>
      <svg
        className={active && bpm ? 'heart-beat' : active ? 'heart-idle' : ''}
        viewBox="0 0 24 24" width="32" height="32" fill="currentColor"
        style={{
          color: active ? '#FF6B8A' : '#666',
          filter: active ? 'drop-shadow(0 0 8px rgba(255,107,138,0.6))' : 'none',
          transition: 'color 0.5s ease, filter 0.5s ease',
        }}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5
                 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08
                 C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5
                 c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"/>
      </svg>
    </div>
  );
}

// ─── Live waveform ────────────────────────────────────────────────────────────
function Waveform({ history }: { history: { bpm: number }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const vals  = history.slice(-30).map(h => h.bpm);
    const min   = Math.min(...vals) - 5;
    const max   = Math.max(...vals) + 5;
    const range = max - min || 1;

    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, 'rgba(255,107,138,0)');
    grad.addColorStop(0.3, 'rgba(255,107,138,0.5)');
    grad.addColorStop(1, 'rgba(255,107,138,1)');

    ctx.beginPath();
    ctx.strokeStyle = grad;
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';

    vals.forEach((v, i) => {
      const x = (i / (vals.length - 1)) * width;
      const y = height - ((v - min) / range) * height * 0.8 - height * 0.1;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    const lastX = width;
    const lastY = height - ((vals[vals.length-1] - min) / range) * height * 0.8 - height * 0.1;
    ctx.beginPath();
    ctx.arc(lastX - 1, lastY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#FF6B8A';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#FF6B8A';
    ctx.fill();
  }, [history]);

  return (
    <canvas ref={canvasRef} width={200} height={40} className="w-full opacity-90" />
  );
}

// ─── Zone badge ───────────────────────────────────────────────────────────────
const ZONE_META = {
  rest:     { label: 'Resting',  color: '#4AE8A0', bg: 'rgba(74,232,160,0.1)' },
  light:    { label: 'Light',    color: '#7AC4FF', bg: 'rgba(122,196,255,0.1)' },
  moderate: { label: 'Moderate', color: '#FFD97D', bg: 'rgba(255,217,125,0.1)' },
  hard:     { label: 'Elevated', color: '#FF9A5C', bg: 'rgba(255,154,92,0.1)' },
  max:      { label: 'High',     color: '#FF6B8A', bg: 'rgba(255,107,138,0.1)' },
};

// ─── Main component ───────────────────────────────────────────────────────────
interface HeartRateMonitorProps {
  variant?: 'compact' | 'full';
  onReading?: (bpm: number) => void;
}

export default function HeartRateMonitor({ variant = 'full', onReading }: HeartRateMonitorProps) {
  const ts = useThemeStyles();
  const { status, current, history, avg, min, max, zone, connect, disconnect, supported, error } = useHeartRate();

  useEffect(() => {
    if (current?.bpm && onReading) onReading(current.bpm);
  }, [current, onReading]);

  // ── Compact variant ───────────────────────────────────────────────────────
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        {status === 'connected' && current ? (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: ts.cardBg,
              border: '1px solid rgba(255,107,138,0.3)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <HeartIcon bpm={current.bpm} active />
            <span className="text-[#FF6B8A] text-sm font-medium tabular-nums">{current.bpm}</span>
            <span className="text-[10px]" style={{ color: ts.textMuted }}>bpm</span>
          </div>
        ) : (
          <button
            onClick={status === 'connected' ? disconnect : connect}
            disabled={!supported}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] transition-all hover:border-[rgba(255,107,138,0.3)] hover:text-[#FF6B8A] disabled:opacity-30"
            style={{ color: ts.textMuted, borderColor: ts.border }}
          >
            <HeartIcon bpm={null} active={false} />
            {supported ? (status === 'connecting' ? 'Connecting…' : 'Connect HR') : 'BT not supported'}
          </button>
        )}
      </div>
    );
  }

  // ── Full variant ──────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col gap-4 p-5 rounded-2xl border transition-all"
      style={{
        background: ts.cardBg,
        border: status === 'connected'
          ? '1px solid rgba(255,107,138,0.35)'
          : `1px solid ${ts.border}`,
        boxShadow: status === 'connected' ? '0 0 30px rgba(255,107,138,0.06)' : 'none',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: status === 'connected' ? 'rgba(255,107,138,0.12)' : `${ts.border}50`,
              border: status === 'connected'
                ? '1px solid rgba(255,107,138,0.3)'
                : `1px solid ${ts.border}`,
            }}
          >
            <HeartIcon bpm={current?.bpm ?? null} active={status === 'connected'} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: ts.textPrimary }}>Live Heart Rate</p>
            <p
              className="text-[9px] mt-0.5"
              style={{ color: status === 'connected' ? '#FF6B8A' : ts.textDim }}
            >
              {status === 'idle'         && 'Bluetooth · not connected'}
              {status === 'connecting'   && 'Connecting…'}
              {status === 'connected'    && 'Live · BLE connected'}
              {status === 'disconnected' && 'Disconnected'}
              {status === 'unsupported'  && 'Web Bluetooth not supported'}
              {status === 'error'        && (error ?? 'Connection error')}
            </p>
          </div>
        </div>

        <button
          onClick={status === 'connected' ? disconnect : connect}
          disabled={!supported || status === 'connecting'}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105 disabled:opacity-40"
          style={status === 'connected'
            ? { background: 'rgba(255,107,138,0.1)', color: '#FF6B8A', border: '1px solid rgba(255,107,138,0.3)' }
            : { background: 'linear-gradient(135deg,#8B1A3A,#CC2244)', color: '#fff' }
          }
        >
          {status === 'connecting' ? 'Connecting…' : status === 'connected' ? 'Disconnect' : 'Connect'}
        </button>
      </div>

      {/* Live BPM display */}
      {status === 'connected' && current && (
        <>
          <div className="flex items-end gap-4">
            <div className="flex items-baseline gap-1">
              <span
                className="text-5xl font-light tabular-nums leading-none"
                style={{ color: '#FF6B8A', textShadow: '0 0 20px rgba(255,107,138,0.4)' }}
              >
                {current.bpm}
              </span>
              <span className="text-sm mb-1" style={{ color: ts.textMuted }}>bpm</span>
            </div>
            {zone && (
              <div
                className="mb-1 px-2.5 py-1 rounded-full text-[10px] font-medium"
                style={{ color: ZONE_META[zone].color, background: ZONE_META[zone].bg }}
              >
                {ZONE_META[zone].label}
              </div>
            )}
          </div>

          {history.length > 2 && (
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: `${ts.pageBg}CC`, padding: '8px 12px' }}
            >
              <Waveform history={history} />
            </div>
          )}

          {history.length > 5 && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Average', value: `${avg} bpm` },
                { label: 'Min',     value: `${min} bpm` },
                { label: 'Max',     value: `${max} bpm` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col gap-0.5 p-2.5 rounded-xl text-center"
                  style={{ background: ts.cardBg, border: `1px solid ${ts.border}` }}
                >
                  <p className="text-[#FF6B8A] text-xs font-medium tabular-nums">{value}</p>
                  <p className="text-[9px] uppercase tracking-wide" style={{ color: ts.textMuted }}>{label}</p>
                </div>
              ))}
            </div>
          )}

          {current.contactDetected === false && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FF9A5C]/10 border border-[#FF9A5C]/20">
              <span className="text-[#FF9A5C] text-xs">⚠️ No skin contact detected — ensure device is on your wrist</span>
            </div>
          )}
        </>
      )}

      {/* Not supported message */}
      {!supported && (
        <div
          className="flex flex-col gap-1.5 px-3 py-3 rounded-xl"
          style={{ background: ts.cardBg, border: `1px solid ${ts.border}` }}
        >
          <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>
            Web Bluetooth requires Chrome or Edge on desktop or Android.
            Safari and Firefox are not supported.
          </p>
        </div>
      )}

      {/* Compatible devices */}
      {status === 'idle' && supported && (
        <details className="group">
          <summary
            className="text-[10px] cursor-pointer hover:text-[#FF6B8A] transition-colors list-none flex items-center gap-1.5"
            style={{ color: ts.textMuted }}
          >
            <span className="group-open:rotate-90 transition-transform inline-block">›</span>
            Compatible devices
          </summary>
          <div className="mt-2 flex flex-col gap-1 pl-4">
            {[
              '🍎 Apple Watch (via iPhone companion app)',
              '⌚ Polar H10, Wahoo Tickr, Garmin straps',
              '📱 Most Bluetooth LE heart rate monitors',
              '🤖 Wear OS devices with HR broadcast enabled',
            ].map(s => (
              <p key={s} className="text-[10px] leading-relaxed" style={{ color: ts.textMuted }}>{s}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
