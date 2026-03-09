// components/AudioPlayer/MusicLibrary.tsx
import { useEffect, useState, useMemo } from "react";
import { useMusic } from "../contexts/MusicContext";
import { Search, Loader2, RefreshCw, Music2, Headphones, Radio, ListMusic, Sparkles, Play, Pause } from "lucide-react";
import NavBar from "../NavBar";
import Footer from "../Footer";

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

// ─── Ad placeholder ───────────────────────────────────────────────────────────
function AdSlot({ label = "Advertisement", className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center border border-dashed border-[#1E3358]/40 rounded-xl bg-[#040A14]/40 ${className}`}>
      <span className="text-[9px] tracking-[0.25em] uppercase text-[#1A2D48] select-none">{label}</span>
    </div>
  );
}

// ─── Sidebar nav item ─────────────────────────────────────────────────────────
function SideItem({
  icon, label, active, onClick, count,
}: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-200 group ${
        active
          ? "bg-[#0D1B33] border border-[#2A5499]/60 text-[#7AC4FF] shadow-[0_0_12px_rgba(74,158,255,0.07)]"
          : "text-[#4A7AAA] hover:text-[#B8D9FF] hover:bg-[#0B1628]/60 border border-transparent"
      }`}
    >
      <span className={`flex-shrink-0 transition-colors ${active ? "text-[#4A9EFF]" : "text-[#2A4060] group-hover:text-[#4A9EFF]"}`}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {count != null && (
        <span className={`text-[9px] tabular-nums ${active ? "text-[#2A5499]" : "text-[#1A2D48]"}`}>{count}</span>
      )}
    </button>
  );
}

// ─── Mini waveform ────────────────────────────────────────────────────────────
function MiniWave({ playing }: { playing: boolean }) {
  return (
    <span className="flex items-center gap-px h-4 flex-shrink-0">
      {[0, 0.1, 0.22, 0.08, 0.18].map((d, i) => (
        <span
          key={i}
          className="w-px rounded-full bg-[#4A9EFF]"
          style={{
            height: playing ? undefined : "4px",
            minHeight: 3,
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
  const [hovered, setHovered] = useState(false);

  const fmtDur = (s: number) =>
    `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

  return (
    <div
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
        isCurrent
          ? "bg-[#0D1B33]/90 border border-[#2A5499]/55 shadow-[0_0_18px_rgba(74,158,255,0.07)]"
          : "border border-transparent hover:bg-[#0B1628]/60 hover:border-[#1E3358]/50"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onPlay}
    >
      {/* Index / indicator */}
      <div className="w-5 flex items-center justify-center flex-shrink-0">
        {isCurrent && isPlaying ? (
          <MiniWave playing />
        ) : hovered || isCurrent ? (
          isPlaying
            ? <Pause size={11} className="text-[#4A9EFF]" />
            : <Play size={11} className={isCurrent ? "text-[#4A9EFF]" : "text-[#5A8FB8]"} />
        ) : (
          <span className="text-[10px] text-[#1E3358] tabular-nums">{index + 1}</span>
        )}
      </div>

      {/* Tiny art */}
      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#0B1628]">
        {track.image ? (
          <img
            src={track.image}
            alt=""
            className={`w-full h-full object-cover transition-opacity duration-300 ${isCurrent ? "opacity-80" : "opacity-55 group-hover:opacity-75"}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music2 size={12} className="text-[#1E3358]" />
          </div>
        )}
      </div>

      {/* Name + artist */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate leading-snug transition-colors ${isCurrent ? "text-[#B8D9FF]" : "text-[#6A9DC0] group-hover:text-[#9CCBFF]"}`}>
          {track.name}
        </p>
        <p className="text-[10px] text-[#2A4060] truncate">{track.artist_name}</p>
      </div>

      {/* Tags */}
      <div className="hidden md:flex items-center gap-1 flex-shrink-0">
        {track.tags.slice(0, 2).map((t, i) => (
          <span
            key={i}
            className={`text-[9px] px-1.5 py-0.5 rounded-full border uppercase tracking-wide transition-colors ${
              isCurrent
                ? "border-[#2A5499]/50 text-[#3D6080] bg-[#0B1628]"
                : "border-[#1A2D48]/60 text-[#1E3358] group-hover:border-[#1E3358] group-hover:text-[#3D6080]"
            }`}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Duration */}
      <span className="text-[10px] text-[#1E3358] tabular-nums flex-shrink-0 w-9 text-right">
        {fmtDur(track.duration)}
      </span>
    </div>
  );
}

// ─── Genres / moods config ─────────────────────────────────────────────────────
const GENRES = ["all", "meditation", "ambient", "relaxation", "chillout", "lounge"] as const;
type Genre = typeof GENRES[number];

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

// ─── Main component ────────────────────────────────────────────────────────────
export function MusicLibrary() {
  const { tracks, loadTracks, playTrack, currentTrack, isPlaying, isLoading, togglePlayPause } = useMusic();

  const [searchQuery, setSearchQuery]   = useState("");
  const [selectedGenre, setSelectedGenre] = useState<Genre>("all");

  // Derived filtered list
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
    <div className="relative flex flex-col min-h-screen bg-[#010814] font-montserrat">
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes mlWave { from{height:3px} to{height:14px} }
        @keyframes mlShimmer { 0%,100%{opacity:.35} 50%{opacity:.7} }
        .ml-skeleton { animation: mlShimmer 1.5s ease-in-out infinite; background:#0A1525; border-radius:8px; }
      `}</style>

      {/* ── Star background ── */}
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/Background_img_Meditation.jpg')`, opacity: 0.35 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, rgba(1,8,20,0.2) 0%, rgba(1,8,20,0.94) 65%)" }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        {/* ── Top leaderboard ad ── */}
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-4">
          <AdSlot label="Ad · 728×90 leaderboard" className="h-12 sm:h-14" />
        </div>

        {/* ── Page header + search ── */}
        <header className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-6 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#2A4060] mb-1">Breathe · Sounds</p>
              <h1 className="text-2xl sm:text-3xl font-light text-[#B8D9FF] tracking-wide">Music Library</h1>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2A4060] pointer-events-none" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tracks, artists, tags…"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#0B1628]/70 border border-[#1E3358]/50 text-[#7AC4FF] text-xs placeholder-[#1E3358] outline-none focus:border-[#2A5499] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2A4060] hover:text-[#5A8FB8] transition-colors text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ── Main body ── */}
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pb-32">
          <div className="flex gap-5">

            {/* ════ LEFT SIDEBAR ════ */}
            <aside className="hidden lg:flex flex-col gap-4 w-52 xl:w-56 flex-shrink-0 pt-1">

              {/* Genre nav */}
              <div className="flex flex-col gap-0.5">
                <p className="text-[9px] tracking-[0.25em] uppercase text-[#1E3358] mb-2.5 px-1">Genre</p>
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

              {/* Divider */}
              <div className="h-px bg-[#1E3358]/25" />

              {/* Refresh */}
              <button
                onClick={() => loadTracks(selectedGenre === "all" ? "meditation" : selectedGenre)}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#3D6080] text-xs border border-[#1E3358]/30 hover:border-[#2A5499]/50 hover:text-[#5A8FB8] transition-all duration-200 disabled:opacity-40"
              >
                <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
                Refresh tracks
              </button>

              {/* Sidebar ad */}
              <AdSlot label="Ad · 160×600 half-page" className="flex-1 min-h-48" />

              {/* Now-playing mini card */}
              {currentTrack && (
                <div className="rounded-2xl bg-[#0B1628]/70 border border-[#1E3358]/50 p-3 flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <MiniWave playing={isPlaying} />
                    <p className="text-[9px] tracking-[0.2em] uppercase text-[#2A4060]">Now Playing</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#0D1B33]">
                      {currentTrack.image
                        ? <img src={currentTrack.image} alt="" className="w-full h-full object-cover opacity-70" />
                        : <div className="w-full h-full flex items-center justify-center"><Music2 size={10} className="text-[#1E3358]" /></div>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-[#8ABADD] text-[10px] truncate font-medium leading-snug">{currentTrack.name}</p>
                      <p className="text-[#2A4060] text-[9px] truncate">{currentTrack.artist_name}</p>
                    </div>
                  </div>
                  <button
                    onClick={togglePlayPause}
                    className="w-full py-1.5 rounded-lg text-[10px] text-white font-medium tracking-wide transition-all hover:shadow-[0_0_16px_rgba(58,130,247,0.35)]"
                    style={{ background: "linear-gradient(135deg,#1A5FCC,#3A82F7)" }}
                  >
                    {isPlaying ? "⏸ Pause" : "▶ Resume"}
                  </button>
                </div>
              )}
            </aside>

            {/* ════ TRACK LIST ════ */}
            <div className="flex-1 min-w-0 flex flex-col gap-3 pt-1">

              {/* Mobile genre pills */}
              <div className="flex lg:hidden gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {GENRES.map(g => (
                  <button
                    key={g}
                    onClick={() => handleGenre(g)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest border transition-all duration-200 ${
                      selectedGenre === g
                        ? "bg-[#0D1B33] border-[#2A5499]/70 text-[#7AC4FF]"
                        : "border-[#1E3358]/40 text-[#3D6080] hover:border-[#2A5499]/50"
                    }`}
                  >
                    {GENRE_LABELS[g]}
                  </button>
                ))}
              </div>

              {/* Status row */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#2A4060] tracking-wide">
                  {isLoading
                    ? "Loading…"
                    : `${filteredTracks.length} track${filteredTracks.length !== 1 ? "s" : ""}${selectedGenre !== "all" ? ` · ${GENRE_LABELS[selectedGenre]}` : ""}`
                  }
                </span>
                {!isLoading && (
                  <button
                    onClick={() => loadTracks(selectedGenre === "all" ? "meditation" : selectedGenre)}
                    className="flex items-center gap-1.5 text-[10px] text-[#2A4060] hover:text-[#5A8FB8] transition-colors lg:hidden"
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
                        <div className="ml-skeleton h-2.5" style={{ width: `${55 + Math.random() * 30}%` }} />
                        <div className="ml-skeleton h-2" style={{ width: `${30 + Math.random() * 20}%` }} />
                      </div>
                    </div>
                  ))
                ) : filteredTracks.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-20">
                    <Music2 size={28} className="text-[#1E3358]" />
                    <p className="text-[#2A4060] text-sm">No tracks found</p>
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="text-[#4A9EFF] text-xs hover:underline">
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

              {/* Bottom rectangle ad */}
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