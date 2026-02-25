// components/contexts/MusicContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const JAMENDO_CLIENT_ID = "a70d8995";
const JAMENDO_API_BASE = "https://api.jamendo.com/v3.0";

interface Track {
  id: string;
  name: string;
  artist_name: string;
  duration: number;
  audio: string;
  image: string;
  genre: string;
  tags: string[];
}

interface MusicContextType {
  currentTrack: Track | null;
  tracks: Track[];
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  playTrack: (track: Track) => void;
  playRandomTrack: () => void;
  playFirstTrack: () => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;
  loadTracks: (tag?: string) => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMutedState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Download treck for render
  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async (tag: string = "meditation") => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=40&tags=${tag}&include=musicinfo&audioformat=mp32`
      );

      if (!response.ok) {
        throw new Error("Couldn't download tracks");
      }

      const data = await response.json();
      
      const transformedTracks: Track[] = data.results.map((track: any) => {
        const genres = track.musicinfo?.tags?.genres || [];
        const instruments = track.musicinfo?.tags?.instruments || [];
        const vartags = track.musicinfo?.tags?.vartags || [];
        const allTags = [...genres, ...instruments, ...vartags].slice(0, 5);

        return {
          id: track.id,
          name: track.name,
          artist_name: track.artist_name,
          duration: track.duration,
          audio: track.audio,
          image: track.album_image || track.image || "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300",
          genre: genres[0] || "meditation",
          tags: allTags.length > 0 ? allTags : ["music", "meditation"]
        };
      });

      setTracks(transformedTracks);
    } catch (err) {
      console.error("Error loading tracks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const playRandomTrack = () => {
    if (tracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[randomIndex]);
    }
  };

  const playFirstTrack = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0]);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (tracks.length === 0 || !currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  };

  const previousTrack = () => {
    if (tracks.length === 0 || !currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex]);
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (newVolume > 0) {
      setIsMutedState(false);
    }
  };

  const setIsMuted = (muted: boolean) => {
    setIsMutedState(muted);
  };

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        tracks,
        isPlaying,
        volume,
        isMuted,
        isLoading,
        playTrack,
        playRandomTrack,
        playFirstTrack,
        togglePlayPause,
        nextTrack,
        previousTrack,
        setVolume,
        setIsMuted,
        loadTracks,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
