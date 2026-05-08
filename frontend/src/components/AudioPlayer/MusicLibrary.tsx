// src/components/AudioPlayer/MusicLibrary.tsx
import { useEffect, useState, useMemo } from "react";
import { useMusic } from "../contexts/MusicContext";
import { Search, RefreshCw, Music2, Headphones, Radio, ListMusic, Sparkles, Play, Pause } from "lucide-react";
import NavBar from "../NavBar";
import Footer from "../Footer";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import ThemeBackground from "../../components/ThemeBackground";

// ─── Types ────────────────────────────────────────────────────────────────────
type Track = {
  id: string;
  name: string;
  artist_name: string;
  duration: number;
  audio: string;
  image: string;
  genre: string;
  tags: string[];
};

type Genre = "all" | "meditation" | "ambient" | "relaxation" | "chillout" | "lounge";

const GENRES: Genre[] = ["all", "meditation", "ambient", "relaxation", "chillout", "lounge"];

const GENRE_ICONS: Record<Genre, React.ReactNode> = {
  all:        <Sparkles size={13} />,
  meditation: <Headphones size={13} />,
  ambient:    <Radio size={13} />,
  relaxation: <Music2 size={13} />,
  chillout:   <ListMusic size={13} />,
  lounge:     <Music2 size={13} />,
};

const GENRE_LABELS: Record<Genre, string> = {
  all:        "Everything",
  meditation: "Meditation",
  ambient:    "Ambient",
  relaxation: "Relaxation",
  chillout:   "Chill Out",
  lounge:     "Lounge",
};

// ─── Ad placeholder ───────────────────────────────────────────────────────────
function AdSlot({ label = "Advertisement", className = "" }: { label?: string; className?: string }) {
  const ts = useThemeStyles();
  return (
    <div
      className={`flex items-center justify-center border border-dashed rounded-xl ${className}`}
      style={{
        borderColor: ts.border,
        backgroundColor: `${ts.cardBg}40`,
      }}
    >
      <span className="t-label tracking-widest uppercase select-none" style={{ color: ts.textDim }}>
        {label}
      </span>
    </div>
  );
}

// ─── Sidebar nav item ─────────────────────────────────────────────────────────
function SideItem({
  icon, label, active, onClick, count,
}: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; count?: number }) {
  const ts = useThemeStyles();
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl t-caption transition-all duration-200"
      style={{
        backgroundColor: active ? ts.cardBgHover : ts.cardBg,
        borderColor: active ? ts.borderHover : "transparent",
        color: active ? ts.textSecondary : ts.textMuted,
      }}
    >
      <span className="flex-shrink-0 transition-colors" style={{ color: active ? ts.accent : ts.textDim }}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {count != null && (
        <span className="t-label tabular-nums" style={{ color: ts.textDim }}>{count}</span>
      )}
    </button>
  );
}

// ─── Mini waveform ────────────────────────────────────────────────────────────
function MiniWave({ playing }: { playing: boolean }) {
  const ts = useThemeStyles();
  return (
    <span className="flex items-center gap-px h-4 flex-shrink-0">
      {[0, 0.1, 0.22, 0.08, 0.18].map((d, i) => (
        <span
          key={i}
          className="w-px rounded-full"
          style={{
            height: playing ? undefined : "4px",
            minHeight: 3,
            backgroundColor: ts.accent,
            animation: playing ? `mlWave 0.8s ease-in-out ${d}s infinite alternate` : "none",
          }}
        />
      ))}
    </span>
  );
}

// ─── Track card (compact) ─────────────────────────────────────────────────────
function TrackCard({
  track, index, isCurrent, isPlaying, onPlay,
}: { track: Track; index: number; isCurrent: boolean; isPlaying: boolean; onPlay: () => void }) {
  const ts = useThemeStyles();
  const [hovered, setHovered] = useState(false);

  const fmtDur = (s: number) =>
    `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

  return (
    <div
      className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onPlay}
      style={{
        backgroundColor: isCurrent ? ts.cardBgHover : ts.cardBg,
        borderColor: isCurrent ? ts.borderHover : "transparent",
      }}
    >
      {/* Index / indicator */}
      <div className="w-5 flex items-center justify-center flex-shrink-0">
        {isCurrent && isPlaying ? (
          <MiniWave playing />
        ) : hovered || isCurrent ? (
          isPlaying
            ? <Pause size={11} style={{ color: ts.accent }} />
            : <Play size={11} style={{ color: isCurrent ? ts.accent : ts.textSecondary }} />
        ) : (
          <span className="t-label tabular-nums" style={{ color: ts.textDim }}>{index + 1}</span>
        )}
      </div>

      {/* Tiny art */}
      <div
        className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0"
        style={{ backgroundColor: ts.pageBg }}
      >
        {track.image ? (
          <img
            src={track.image}
            alt=""
            className={`w-full h-full object-cover transition-opacity duration-300 ${isCurrent ? "opacity-80" : "opacity-55 group-hover:opacity-75"}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music2 size={12} style={{ color: ts.textDim }} />
          </div>
        )}
      </div>

      {/* Name + artist */}
      <div className="flex-1 min-w-0">
        <p
          className="t-caption font-medium truncate leading-snug transition-colors"
          style={{ color: isCurrent ? ts.textPrimary : ts.textSecondary }}
        >
          {track.name}
        </p>
        <p className="t-label truncate" style={{ color: ts.textMuted }}>
          {track.artist_name}
        </p>
      </div>

      {/* Tags */}
      <div className="hidden md:flex items-center gap-1 flex-shrink-0">
        {track.tags.slice(0, 2).map((t, i) => (
          <span
            key={i}
            className="t-label px-1.5 py-0.5 rounded-full border uppercase tracking-wide"
            style={{
              color: ts.textDim,
              backgroundColor: ts.cardBg,
              borderColor: isCurrent ? ts.borderHover : ts.border,
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Duration */}
      <span className="t-label tabular-nums flex-shrink-0 w-9 text-right" style={{ color: ts.textDim }}>
        {fmtDur(track.duration)}
      </span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function MusicLibrary() {
  const { tracks, loadTracks, playTrack, currentTrack, isPlaying, isLoading, togglePlayPause } = useMusic();
  const ts = useThemeStyles();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<Genre>("all");

  const filteredTracks = useMemo(() => {
    let out: Track[] = tracks;
    if (selectedGenre !== "all") {
      out = out.filter(t =>
        t.genre?.toLowerCase() === selectedGenre ||
        t.tags?.some(tag => tag.toLowerCase() === selectedGenre)
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      out = out.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.artist_name.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    return out;
  }, [tracks, searchQuery, selectedGenre]);

  const handleGenre = (g: Genre) => {
    setSelectedGenre(g);
    loadTracks(g === "all" ? "meditation" : g);
  };

  const handlePlay = (track: Track) => {
    if (currentTrack?.id === track.id) { togglePlayPause(); return; }
    playTrack(track);
  };

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        {/* Top leaderboard ad */}
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-4">
          <AdSlot label="Ad · 728×90 leaderboard" className="h-12 sm:h-14" />
        </div>

        {/* Page header + search */}
        <header className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-6 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="t-label tracking-[0.3em] uppercase" style={{ color: ts.textMuted }}>Breathe · Sounds</p>
              <h1 className="text-2xl sm:text-3xl font-light" style={{ color: ts.textPrimary }}>Music Library</h1>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: ts.textMuted }} />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tracks, artists, tags…"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl t-caption outline-none transition-colors"
                style={{
                  backgroundColor: ts.cardBg,
                  border: `1px solid ${ts.border}`,
                  color: ts.textSecondary,
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 t-caption transition-colors"
                  style={{ color: ts.textMuted }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main body */}
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pb-32">
          <div className="flex gap-5">

            {/* LEFT SIDEBAR */}
            <aside className="hidden lg:flex flex-col gap-4 w-52 xl:w-56 flex-shrink-0 pt-1">
              <div className="flex flex-col gap-0.5">
                <p
                  className="t-label tracking-[0.25em] uppercase mb-2.5 px-1"
                  style={{ color: ts.textDim }}
                >
                  Genre
                </p>
                {GENRES.map(g => (
                  <SideItem
                    key={g}
                    icon={GENRE_ICONS[g]}
                    label={GENRE_LABELS[g]}
                    active={selectedGenre === g}
                    onClick={() => handleGenre(g)}
                  />
                ))}
              </div>

              <div className="h-px" style={{ backgroundColor: ts.border }} />

              <button
                onClick={() => loadTracks(selectedGenre === "all" ? "meditation" : selectedGenre)}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl t-caption border transition-all duration-200 disabled:opacity-40"
                style={{ color: ts.textMuted, borderColor: ts.border }}
              >
                <RefreshCw size={10} className={isLoading ? "animate-spin" : ""} />
                Refresh tracks
              </button>

              <AdSlot label="Ad · 160×600 half-page" className="flex-1 min-h-48" />
            </aside>

            {/* TRACK LIST */}
            <div className="flex-1 min-w-0 flex flex-col gap-3 pt-1">
              {/* Mobile genre pills */}
              <div className="flex lg:hidden gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {GENRES.map(g => (
                  <button
                    key={g}
                    onClick={() => handleGenre(g)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full t-label uppercase tracking-widest border transition-all duration-200"
                    style={{
                      backgroundColor: selectedGenre === g ? ts.cardBgHover : ts.cardBg,
                      borderColor: selectedGenre === g ? ts.borderHover : ts.border,
                      color: selectedGenre === g ? ts.textPrimary : ts.textMuted,
                    }}
                  >
                    {GENRE_LABELS[g]}
                  </button>
                ))}
              </div>

              {/* Status row */}
              <div className="flex items-center justify-between">
                <span className="t-label tracking-wide" style={{ color: ts.textMuted }}>
                  {isLoading
                    ? "Loading…"
                    : `${filteredTracks.length} track${filteredTracks.length !== 1 ? "s" : ""}${selectedGenre !== "all" ? ` · ${GENRE_LABELS[selectedGenre]}` : ""}`
                  }
                </span>
                {!isLoading && (
                  <button
                    onClick={() => loadTracks(selectedGenre === "all" ? "meditation" : selectedGenre)}
                    className="flex items-center gap-1.5 t-label transition-colors lg:hidden"
                    style={{ color: ts.textMuted }}
                  >
                    <RefreshCw size={10} /> Refresh
                  </button>
                )}
              </div>

              {/* Tracks */}
              <div className="flex flex-col gap-0.5">
                {isLoading ? (
                  Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="ml-skeleton w-5 h-3 flex-shrink-0" />
                      <div className="ml-skeleton w-9 h-9 rounded-lg flex-shrink-0" />
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="ml-skeleton h-2.5" style={{ width: `${[72, 58, 80, 65, 75, 55, 70, 68, 62][i % 9]}%` }} />
                        <div className="ml-skeleton h-2" style={{ width: `${[40, 35, 45, 38, 42, 32, 44, 36, 40][i % 9]}%` }} />
                      </div>
                    </div>
                  ))
                ) : filteredTracks.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-20">
                    <Music2 size={28} style={{ color: ts.textDim }} />
                    <p className="t-body" style={{ color: ts.textMuted }}>No tracks found</p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="t-caption hover:underline"
                        style={{ color: ts.accent }}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  filteredTracks.map((track, i) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      index={i}
                      isCurrent={currentTrack?.id === track.id}
                      isPlaying={isPlaying && currentTrack?.id === track.id}
                      onPlay={() => handlePlay(track)}
                    />
                  ))
                )}
              </div>

              {!isLoading && filteredTracks.length > 0 && (
                <AdSlot label="Ad · 300×250 medium rectangle" className="h-28 mt-4" />
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
