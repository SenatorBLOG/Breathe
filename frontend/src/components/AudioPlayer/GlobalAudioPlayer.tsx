// components/AudioPlayer/GlobalAudioPlayer.tsx
import { useRef, useEffect, useState, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download, X, Music2 } from "lucide-react";
import { useMusic } from "../contexts/MusicContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(s: number) {
  if (!s || isNaN(s)) return "0:00";
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

// ─── Mini wave ────────────────────────────────────────────────────────────────
function MiniWave({ playing }: { playing: boolean }) {
  return (
    <span className="flex items-center gap-px h-4 flex-shrink-0">
      {[0, 0.12, 0.24, 0.08, 0.20, 0.15, 0.05].map((d, i) => (
        <span
          key={i}
          className="w-0.5 rounded-full bg-[#4A9EFF]"
          style={{
            height: playing ? undefined : "4px",
            minHeight: 3,
            animation: playing ? `gapWave 0.85s ease-in-out ${d}s infinite alternate` : "none",
          }}
        />
      ))}
    </span>
  );
}

// ─── Seek bar ─────────────────────────────────────────────────────────────────
function SeekBar({ current, total, onChange }: { current: number; total: number; onChange: (t: number) => void }) {
  const ref   = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState(false);
  const pct   = total > 0 ? (current / total) * 100 : 0;

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
      <div className="absolute inset-0 rounded-full bg-[#1E3358]/50" />
      <div
        className="absolute top-0 left-0 h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg,#1A5FCC,#4A9EFF)",
          boxShadow: hot ? "0 0 8px rgba(74,158,255,0.55)" : "none",
          transition: "box-shadow 0.15s",
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
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);
  const eff  = muted ? 0 : volume;

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
        className="text-[#4A7AAA] hover:text-[#7AC4FF] transition-colors p-1.5"
      >
        {eff === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
      {open && (
        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 py-2 px-1.5 rounded-xl bg-[#060C1A]/95 border border-[#1E3358]/60 backdrop-blur-md shadow-lg">
          <div ref={ref} className="relative w-1.5 h-20 rounded-full bg-[#1E3358]/50 cursor-pointer" onClick={seek}>
            <div
              className="absolute bottom-0 left-0 right-0 rounded-full"
              style={{ height: `${eff}%`, background: "linear-gradient(to top,#1A5FCC,#4A9EFF)" }}
            />
          </div>
          <span className="text-[8px] text-[#2A4060] tabular-nums">{eff}</span>
        </div>
      )}
    </div>
  );
}

// ─── Player ───────────────────────────────────────────────────────────────────
export function GlobalAudioPlayer() {
  const {
    currentTrack, isPlaying, volume, isMuted,
    togglePlayPause, nextTrack, previousTrack,
    setVolume, setIsMuted,
  } = useMusic();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);
  const [visible,     setVisible]     = useState(true);
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
    const onEnd  = () => nextTrack();
    a.addEventListener("timeupdate",     onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended",          onEnd);
    return () => {
      a.removeEventListener("timeupdate",     onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended",          onEnd);
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
        @keyframes slideUp  { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        .gap-player { animation: slideUp 0.35s cubic-bezier(.34,1.56,.64,1) forwards; }
      `}</style>

      <audio ref={audioRef} src={currentTrack.audio} />

      {!visible ? (
        /* ── Collapsed pill ── */
        <button
          onClick={() => setVisible(true)}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-[#060C1A]/92 border border-[#1E3358]/60 backdrop-blur-md shadow-lg hover:border-[#2A5499] transition-all"
        >
          <MiniWave playing={isPlaying} />
          <span className="text-[#7AC4FF] text-xs max-w-[120px] truncate">{currentTrack.name}</span>
        </button>
      ) : (
        /* ── Full player ── */
        <div className="gap-player fixed bottom-0 left-0 right-0 z-50 font-montserrat">
          {/* Progress line — very top */}
          <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
            <div
              className="h-full"
              style={{
                width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                background: "linear-gradient(90deg,#1A5FCC,#4A9EFF)",
                boxShadow: "0 0 6px rgba(74,158,255,0.6)",
                transition: "width 0.5s linear",
              }}
            />
          </div>

          <div
            style={{
              background: "linear-gradient(180deg,rgba(4,10,20,0.97),rgba(6,12,26,0.99))",
              borderTop: "1px solid rgba(30,51,88,0.45)",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.65), 0 -1px 0 rgba(74,158,255,0.06)",
            }}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
              <div className="flex items-center gap-4 sm:gap-6">

                {/* Track info */}
                <div className="flex items-center gap-3 w-48 sm:w-56 flex-shrink-0 min-w-0">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#0D1B33]">
                    {currentTrack.image
                      ? <img src={currentTrack.image} alt="" className="w-full h-full object-cover opacity-75" />
                      : <div className="w-full h-full flex items-center justify-center"><Music2 size={13} className="text-[#1E3358]" /></div>
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[#B8D9FF] text-xs font-medium truncate leading-snug">{currentTrack.name}</p>
                    <p className="text-[#3D6080] text-[10px] truncate">{currentTrack.artist_name}</p>
                  </div>
                  <MiniWave playing={isPlaying} />
                </div>

                {/* Controls + seek */}
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={previousTrack} className="text-[#2A4060] hover:text-[#7AC4FF] transition-colors p-1 hover:scale-110 active:scale-95 duration-150">
                      <SkipBack size={14} />
                    </button>
                    <button
                      onClick={togglePlayPause}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-[0_0_20px_rgba(58,130,247,0.5)] flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#1A5FCC,#3A82F7)" }}
                    >
                      {isPlaying
                        ? <svg width="10" height="12" viewBox="0 0 10 12" fill="white"><rect x="0" y="0" width="3.5" height="12" rx="1"/><rect x="6.5" y="0" width="3.5" height="12" rx="1"/></svg>
                        : <svg width="10" height="12" viewBox="0 0 10 12" fill="white"><path d="M1 0.5l8 5.5-8 5.5V0.5z"/></svg>
                      }
                    </button>
                    <button onClick={nextTrack} className="text-[#2A4060] hover:text-[#7AC4FF] transition-colors p-1 hover:scale-110 active:scale-95 duration-150">
                      <SkipForward size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#2A4060] tabular-nums w-8 text-right flex-shrink-0">{fmt(currentTime)}</span>
                    <SeekBar
                      current={currentTime}
                      total={Math.max(1, duration)}
                      onChange={t => { setCurrentTime(t); if (audioRef.current) audioRef.current.currentTime = t; }}
                    />
                    <span className="text-[10px] text-[#2A4060] tabular-nums w-8 flex-shrink-0">{fmt(duration)}</span>
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
                    className="text-[#2A4060] hover:text-[#7AC4FF] transition-colors p-1.5"
                    title="Download"
                  >
                    <Download size={13} />
                  </button>
                  <button onClick={() => setVisible(false)} className="text-[#2A4060] hover:text-[#5A8FB8] p-1.5 ml-1" title="Minimise">
                    <X size={13} />
                  </button>
                </div>

                {/* Mobile close */}
                <button onClick={() => setVisible(false)} className="sm:hidden text-[#2A4060] hover:text-[#5A8FB8] p-1">
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