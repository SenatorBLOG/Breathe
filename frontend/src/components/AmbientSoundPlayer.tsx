// src/components/AmbientSoundPlayer.tsx
// Web Audio API synthesized ambient sounds — no files needed.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { CloudRain, Waves, Leaf, Wind, Volume2, Music } from 'lucide-react';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTranslation } from 'react-i18next';

type SoundType = 'rain' | 'ocean' | 'forest' | 'white';

// ── Synthesis helpers ──────────────────────────────────────────────────────────

function makeNoise(ctx: AudioContext, type: SoundType): AudioNode {
  const sampleRate  = ctx.sampleRate;
  const bufferSize  = sampleRate * 4; // 4-second looping buffer

  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const data   = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  } else if (type === 'rain') {
    // Brown noise (low, rumbling — rain-like)
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      data[i] = last * 3.5;
    }
  } else if (type === 'forest' || type === 'ocean') {
    // Pink noise (Paul Kellet's approximation)
    const b = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b[0] = 0.99886 * b[0] + white * 0.0555179;
      b[1] = 0.99332 * b[1] + white * 0.0750759;
      b[2] = 0.96900 * b[2] + white * 0.1538520;
      b[3] = 0.86650 * b[3] + white * 0.3104856;
      b[4] = 0.55000 * b[4] + white * 0.5329522;
      b[5] = -0.7616 * b[5] - white * 0.0168980;
      data[i] = (b[0]+b[1]+b[2]+b[3]+b[4]+b[5]+b[6] + white * 0.5362) * 0.11;
      b[6] = white * 0.115926;
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop   = true;

  // For ocean: slow LFO amplitude modulation (wave swell)
  if (type === 'ocean') {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.12; // ~8s per wave
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.4;
    lfo.connect(lfoGain);
    const mainGain = ctx.createGain();
    mainGain.gain.value = 0.6;
    lfoGain.connect(mainGain.gain);
    source.connect(mainGain);
    lfo.start();
    return mainGain;
  }

  // For forest: add a high-pass filter to sound airier
  if (type === 'forest') {
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 800;
    hp.Q.value = 0.5;
    source.connect(hp);
    return hp;
  }

  return source;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface AmbientSoundPlayerProps {
  inline?: boolean;
}

export default function AmbientSoundPlayer({ inline = false }: AmbientSoundPlayerProps) {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  const SOUNDS: { id: SoundType; label: string; icon: ReactNode }[] = [
    { id: 'rain',   label: t('ambient.sounds.rain'),   icon: <CloudRain size={18} /> },
    { id: 'ocean',  label: t('ambient.sounds.ocean'),  icon: <Waves size={18} /> },
    { id: 'forest', label: t('ambient.sounds.forest'), icon: <Leaf size={18} /> },
    { id: 'white',  label: t('ambient.sounds.white'),  icon: <Wind size={18} /> },
  ];
  const [active, setActive]   = useState<SoundType | null>(null);
  const [volume, setVolume]   = useState(0.35);
  const [expanded, setExpanded] = useState(false);

  const ctxRef        = useRef<AudioContext | null>(null);
  const gainRef       = useRef<GainNode | null>(null);
  const sourceRef     = useRef<AudioBufferSourceNode | null>(null);
  const cleanupRef    = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    sourceRef.current = null;
  }, []);

  const play = useCallback((id: SoundType, vol: number) => {
    stop();
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 1.2);
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    const noise = makeNoise(ctx, id);
    noise.connect(masterGain);

    // Start the source (it may be inside the noise chain)
    const findAndStart = (node: AudioNode) => {
      if (node instanceof AudioBufferSourceNode) {
        node.start();
        sourceRef.current = node;
      }
    };
    // Walk the graph: for BufferSource nodes nested inside gains/filters
    // we rely on the fact that `makeNoise` always starts from a BufferSource
    const startAll = (n: AudioNode) => {
      if (n instanceof AudioBufferSourceNode) { n.start(); sourceRef.current = n; }
    };

    // Re-walk: simpler approach — just find the buffer source
    let bufSrc: AudioBufferSourceNode | null = null;
    const walk = (n: AudioNode) => {
      if (n instanceof AudioBufferSourceNode) bufSrc = n;
    };
    // Can't truly walk the graph backwards; instead, call start on the returned node chain
    // by tracking via the known structure in makeNoise:
    // For ocean: noise is a GainNode, source is bufSrc inside
    // We'll store the source separately
    const src = ctx.createBufferSource();
    // We already called makeNoise which created its own source; just start whatever came out
    // Actually let's refactor to return both:
    if (noise instanceof AudioBufferSourceNode) {
      noise.start();
      sourceRef.current = noise;
    }

    cleanupRef.current = () => {
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setTimeout(() => {
        try { sourceRef.current?.stop(); } catch {}
      }, 600);
    };
  }, [stop]);

  // Simpler re-implementation: makeNoise returns { node, start }
  const playSound = useCallback((id: SoundType, vol: number) => {
    stop();
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data   = buffer.getChannelData(0);

    if (id === 'white') {
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    } else if (id === 'rain') {
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        data[i] = last * 3.5;
      }
    } else {
      // pink noise for forest + ocean base
      const b = [0,0,0,0,0,0,0];
      for (let i = 0; i < bufferSize; i++) {
        const wh = Math.random() * 2 - 1;
        b[0] = 0.99886*b[0] + wh*0.0555179;
        b[1] = 0.99332*b[1] + wh*0.0750759;
        b[2] = 0.96900*b[2] + wh*0.1538520;
        b[3] = 0.86650*b[3] + wh*0.3104856;
        b[4] = 0.55000*b[4] + wh*0.5329522;
        b[5] = -0.7616*b[5] - wh*0.0168980;
        data[i] = (b[0]+b[1]+b[2]+b[3]+b[4]+b[5]+b[6] + wh*0.5362)*0.11;
        b[6] = wh*0.115926;
      }
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop   = true;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 1.5);
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    let chain: AudioNode = src;

    if (id === 'forest') {
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 600;
      src.connect(hp);
      chain = hp;
    } else if (id === 'ocean') {
      // Bandpass shapes pink noise into wave-rush character (200–800 Hz body)
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 380;
      bp.Q.value = 0.65;
      src.connect(bp);

      // A gentle low-shelf adds underwater rumble
      const shelf = ctx.createBiquadFilter();
      shelf.type = 'lowshelf';
      shelf.frequency.value = 150;
      shelf.gain.value = 6;
      bp.connect(shelf);

      // waveGain: LFO sweeps 0.1 → 0.9 → creates swell rhythm
      const waveGain = ctx.createGain();
      waveGain.gain.value = 0.5;        // center; LFO adds ±0.38
      shelf.connect(waveGain);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.12;       // one wave every ~8 s
      const lfoScale = ctx.createGain();
      lfoScale.gain.value = 0.38;
      lfo.connect(lfoScale);
      lfoScale.connect(waveGain.gain);  // modulates waveGain, NOT masterGain
      lfo.start();

      chain = waveGain;                 // chain.connect(masterGain) done below
    }

    chain.connect(masterGain);
    src.start();
    sourceRef.current = src;

    cleanupRef.current = () => {
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      setTimeout(() => { try { src.stop(); } catch {} }, 700);
    };
  }, [stop]);

  const toggle = (id: SoundType) => {
    if (active === id) { stop(); setActive(null); }
    else { playSound(id, volume); setActive(id); }
  };

  // Volume change while playing
  useEffect(() => {
    if (gainRef.current && active) {
      gainRef.current.gain.linearRampToValueAtTime(volume, (ctxRef.current?.currentTime ?? 0) + 0.3);
    }
  }, [volume, active]);

  // Cleanup on unmount
  useEffect(() => () => { stop(); ctxRef.current?.close(); }, [stop]);

  // ── Inline mode (embedded in a panel, no toggle/popup) ───────────────────
  if (inline) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="grid grid-cols-4 gap-1.5">
          {SOUNDS.map(s => (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl border t-label transition-all"
              style={{
                background: active === s.id ? `${ts.accent}18` : ts.cardBgHover,
                borderColor: active === s.id ? ts.borderHover : ts.border,
                color: active === s.id ? ts.accentLight : ts.textMuted,
                boxShadow: active === s.id ? `0 0 12px ${ts.accent}22` : 'none',
              }}
            >
              {s.icon}
              <span style={{ fontSize: 9, letterSpacing: '0.05em' }}>{s.label}</span>
            </button>
          ))}
        </div>
        {active && (
          <div className="flex items-center gap-2 px-0.5 pt-0.5">
            <Volume2 size={14} style={{ color: ts.textDim, flexShrink: 0 }} />
            <input
              type="range" min={0} max={1} step={0.01} value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="flex-1"
              style={{ accentColor: ts.accent }}
            />
            <span className="t-label tabular-nums w-7 text-right" style={{ color: ts.textDim }}>
              {Math.round(volume * 100)}%
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl t-caption transition-all w-full"
        style={{
          background: expanded ? `${ts.accent}14` : 'transparent',
          border: `1px solid ${expanded ? ts.accent + '40' : ts.border}`,
          color: ts.textSecondary,
        }}
      >
        <Music size={13} />
        <span className="flex-1 text-left truncate" style={{ fontSize: 11 }}>{t('ambient.label')}</span>
        {active && <span className="t-label px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: ts.accent, color: '#fff', fontSize: 9 }}>ON</span>}
        <span style={{ color: ts.textDim, fontSize: 9 }}>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div
          className="absolute left-0 right-0 z-50 rounded-2xl p-3 flex flex-col gap-2"
          style={{
            bottom: 'calc(100% + 8px)',
            background: ts.cardBg,
            border: `1px solid ${ts.borderHover}`,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
          }}
        >
          <p className="t-label uppercase tracking-widest px-1" style={{ color: ts.textDim }}>{t('ambient.soundLabel')}</p>
          {/* Sound buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {SOUNDS.map(s => (
              <button
                key={s.id}
                onClick={() => toggle(s.id)}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl border t-label transition-all"
                style={{
                  background: active === s.id ? `${ts.accent}18` : ts.cardBgHover,
                  borderColor: active === s.id ? ts.accent : ts.border,
                  color: active === s.id ? ts.accentLight : ts.textMuted,
                  boxShadow: active === s.id ? `0 0 12px ${ts.accent}22` : 'none',
                }}
              >
                {s.icon}
                <span style={{ fontSize: 9, letterSpacing: '0.04em' }}>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Volume slider */}
          {active && (
            <div className="flex items-center gap-2 px-1">
              <Volume2 size={14} style={{ color: ts.textDim, flexShrink: 0 }} />
              <input
                type="range" min={0} max={1} step={0.01} value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                className="flex-1 accent-current"
                style={{ accentColor: ts.accent }}
              />
              <span className="t-label tabular-nums w-7 text-right" style={{ color: ts.textDim }}>
                {Math.round(volume * 100)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
