// components/AudioPlayer/GlobalAudioPlayer.tsx
import { useRef, useEffect, useState, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download, X, Music2 } from "lucide-react";
import { useMusic } from "../contexts/MusicContext";
import { useThemeStyles } from "../../hooks/useThemeStyles";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(s: number) {
  if (!s || isNaN(s)) return "0:00";
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

// ─── Mini wave ────────────────────────────────────────────────────────────────
function MiniWave({ playing }: { playing: boolean }) {
  const ts = useThemeStyles();
  return (
    <span className="flex items-center gap-px h-4 flex-shrink-0">
      {[0, 0.12, 0.24, 0.08, 0.20, 0.15, 0.05].map((d, i) => (
        <span
          key={i}
          className="w-px rounded-full"
          style={{
            height: playing ? undefined : "4px",
            minHeight: 3,
            backgroundColor: ts.accent,
            animation: playing ? `gapWave 0.85s ease-in-out ${d}s infinite alternate` : "none",
          }}
        />
      ))}
    </span>
  );
}

// ─── Seek bar ─────────────────────────────────────────────────────────────────
function SeekBar({ current, total, onChange }: { current: number; total: number; onChange: (t: number) => void }) {
  const ts = useThemeStyles();
  const ref = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState(false);
  const pct = total > 0 ? (current / total) * 100 : 0;

  const seek = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, width } = ref.current.getBoundingClientRect();
    onChange(Math.max(0, Math.min(total, ((e.clientX - left) / width) * total)));
  };

  return (
    <div
      ref={ref}
      className="relative flex-1 cursor-pointer"
      style={{ height: hot ? 6 : 3, transition: "height 0.15s ease" }}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      onClick={seek}
    >
      <div className="absolute inset-0 rounded-full" style={{ backgroundColor: ts.border }} />
      <div
        className="absolute top-0 left-0 h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: ts.btnGradient,
          boxShadow: hot ? ts.btnShadow : "none",
          transition: "box-shadow 0.15s",
          willChange: "box-shadow",
        }}
      />
      {hot && (
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow"
          style={{ left: `calc(${pct}% - 6px)`, transition: "left 0.05s" }}
        />
      )}
    </div>
  );
}

// ─── Volume pop-up ────────────────────────────────────────────────────────────
function VolumeControl({ volume, muted, onVolume, onMute }: {
  volume: number; muted: boolean; onVolume: (v: number) => void; onMute: () => void;
}) {
  const ts = useThemeStyles();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const eff = muted ? 0 : volume;

  const seek = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { top, height } = ref.current.getBoundingClientRect();
    onVolume(Math.round(Math.max(0, Math.min(100, (1 - (e.clientY - top) / height) * 100))));
  };

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onMouseEnter={() => setOpen(true)}
        onClick={onMute}
        className="transition-colors p-1.5"
        style={{ color: ts.textMuted }}
      >
        {eff === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
      {open && (
        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 py-2 px-1.5 rounded-xl backdrop-blur-md shadow-lg"
          style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
          <div ref={ref} className="relative w-1.5 h-20 rounded-full cursor-pointer" style={{ backgroundColor: ts.border }} onClick={seek}>
            <div
              className="absolute bottom-0 left-0 right-0 rounded-full"
              style={{ height: `${eff}%`, background: ts.btnGradient }}
            />
          </div>
          <span className="text-[8px] tabular-nums" style={{ color: ts.textDim }}>{eff}</span>
        </div>
      )}
    </div>
  );
}

// ─── Player ───────────────────────────────────────────────────────────────────
export function GlobalAudioPlayer() {
  const ts = useThemeStyles();
  const {
    currentTrack, isPlaying, volume, isMuted,
    togglePlayPause, nextTrack, previousTrack,
    setVolume, setIsMuted,
  } = useMusic();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [visible, setVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.play().catch(console.error) : audioRef.current.pause();
  }, [isPlaying]);

  useEffect(() => {
    setCurrentTime(0);
    if (!audioRef.current) return;
    audioRef.current.load();
    if (isPlaying) audioRef.current.play().catch(console.error);
  }, [currentTrack?.id]);

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onTime = () => setCurrentTime(a.currentTime);
    const onMeta = () => setDuration(a.duration);
    const onEnd = () => nextTrack();
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
    };
  }, [nextTrack]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  if (!currentTrack) return null;

  return (
    <>
      <style>{`
        @keyframes gapWave { from{height:3px} to{height:16px} }
        @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        .gap-player { animation: slideUp 0.35s cubic-bezier(.34,1.56,.64,1) forwards; }
      `}</style>

      <audio ref={audioRef} src={currentTrack.audio} />

      {!visible ? (
        <button
          onClick={() => setVisible(true)}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full border backdrop-blur-md shadow-lg transition-all"
          style={{
            backgroundColor: ts.cardBg,
            borderColor: ts.border,
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = ts.borderHover)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = ts.border)}
        >
          <MiniWave playing={isPlaying} />
          <span className="t-caption max-w-[120px] truncate" style={{ color: ts.textSecondary }}>{currentTrack.name}</span>
        </button>
      ) : (
        <div className="gap-player fixed bottom-0 left-0 right-0 z-50 font-montserrat">
          <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
            <div
              className="h-full"
              style={{
                width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                background: ts.btnGradient,
                boxShadow: ts.btnShadow,
                transition: "width 0.5s linear",
              }}
            />
          </div>

          <div style={{ background: ts.cardBg, borderTop: `1px solid ${ts.border}` }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Track info */}
                <div className="flex items-center gap-3 w-48 sm:w-56 flex-shrink-0 min-w-0">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: ts.cardBg }}>
                    {currentTrack.image ? (
                      <img src={currentTrack.image} alt="" className="w-full h-full object-cover opacity-75" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 size={13} style={{ color: ts.textDim }} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="t-caption font-medium truncate leading-snug" style={{ color: ts.textPrimary }}>{currentTrack.name}</p>
                    <p className="t-label truncate" style={{ color: ts.textMuted }}>{currentTrack.artist_name}</p>
                  </div>
                  <MiniWave playing={isPlaying} />
                </div>

                {/* Controls + seek */}
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={previousTrack} className="transition-colors p-1" style={{ color: ts.textMuted }}>
                      <SkipBack size={14} />
                    </button>
                    <button
                      onClick={togglePlayPause}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-[0_0_20px_rgba(58,130,247,0.5)] flex-shrink-0"
                      style={{ background: ts.btnGradient }}
                    >
                      {isPlaying ? (
                        <svg width="10" height="12" viewBox="0 0 10 12" fill="white">
                          <rect x="0" y="0" width="3.5" height="12" rx="1" />
                          <rect x="6.5" y="0" width="3.5" height="12" rx="1" />
                        </svg>
                      ) : (
                        <svg width="10" height="12" viewBox="0 0 10 12" fill="white">
                          <path d="M1 0.5l8 5.5-8 5.5V0.5z" />
                        </svg>
                      )}
                    </button>
                    <button onClick={nextTrack} className="transition-colors p-1" style={{ color: ts.textMuted }}>
                      <SkipForward size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="t-label tabular-nums w-8 text-right flex-shrink-0" style={{ color: ts.textDim }}>{fmt(currentTime)}</span>
                    <SeekBar
                      current={currentTime}
                      total={Math.max(1, duration)}
                      onChange={t => { setCurrentTime(t); if (audioRef.current) audioRef.current.currentTime = t; }}
                    />
                    <span className="t-label tabular-nums w-8 flex-shrink-0" style={{ color: ts.textDim }}>{fmt(duration)}</span>
                  </div>
                </div>

                {/* Right actions */}
                <div className="hidden sm:flex items-center gap-0.5 flex-shrink-0">
                  <VolumeControl
                    volume={volume}
                    muted={isMuted}
                    onVolume={v => { setVolume(v); if (v === 0) setIsMuted(true); else setIsMuted(false); }}
                    onMute={() => setIsMuted(!isMuted)}
                  />
                  <button
                    onClick={() => window.open(currentTrack.audio, "_blank")}
                    className="transition-colors p-1.5"
                    style={{ color: ts.textMuted }}
                    title="Download"
                  >
                    <Download size={13} />
                  </button>
                  <button onClick={() => setVisible(false)} className="transition-colors p-1.5 ml-1" style={{ color: ts.textMuted }} title="Minimise">
                    <X size={13} />
                  </button>
                </div>

                {/* Mobile close */}
                <button onClick={() => setVisible(false)} className="sm:hidden transition-colors p-1" style={{ color: ts.textMuted }}>
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}