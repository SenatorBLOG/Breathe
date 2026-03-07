// components/AudioPlayer/GlobalAudioPlayer.tsx
import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  X
} from "lucide-react";
import { useMusic } from "../contexts/MusicContext";

export function GlobalAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    setIsMuted,
    playTrack,
  } = useMusic();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // sync wwith playing context
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Relog when data change
  useEffect(() => {
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
        });
      }
    }
  }, [currentTrack?.id]);

  // Time update and audion 
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnd = () => {
      nextTrack();
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnd);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnd);
    };
  }, [nextTrack]);

  // Управление громкостью
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return "0:00"; // Unification for the 0 value
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Dont show the player if its epmty
  if (!currentTrack || !isVisible) {
    return currentTrack ? (
      <audio ref={audioRef} src={currentTrack.audio} />
    ) : null;
  }

  return (
    <>
      <audio ref={audioRef} src={currentTrack.audio} />

      <Card className="fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg bg-[#14233a] backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              {/* Track Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={currentTrack.image}
                  alt={currentTrack.name}
                  className="w-14 h-14 rounded object-cover"
                />
                <div className="min-w-0">
                  <h4 className="line-clamp-1">{currentTrack.name}</h4>
                  <p className="text-muted-foreground line-clamp-1">
                    {currentTrack.artist_name}
                  </p>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex-1 max-w-2xl space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={previousTrack}
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="default"
                    size="icon"
                    className="w-10 h-10"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextTrack}
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground min-w-[40px]">
                    {formatTime(currentTime)}
                  </span>
                  <Slider
                    value={[currentTime]}
                    max={Math.max(1, duration)}
                    step={1}
                    onValueChange={(vals: number[]) => {
                      handleSeek(vals);
                    }}
                    className="flex-1 h-1"
                  />
                  <span className="text-xs text-muted-foreground min-w-[40px]">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Volume Control & Close */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="hidden md:flex"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
                
                <Slider
                  value={[isMuted ? 0 : volume]}
                  defaultValue={[100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(vals: number[]) => {
                    const v = Array.isArray(vals) ? vals[0] : Number(vals);
                    setVolume(Number(v));
                  }}
                  className="w-24 md:bw-24 [&>[data-slot=slider-range]]:bg-[#3A82F7]"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(currentTrack.audio, '_blank')}
                  className="hidden md:flex"
                >
                  <Download className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsVisible(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
