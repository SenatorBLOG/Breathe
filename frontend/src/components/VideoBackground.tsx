// src/components/VideoBackground.tsx
import React, { useEffect, useRef } from "react";
import type { Phase } from "./BreathingCircle";

interface VideoBackgroundProps {
  videoFiles: string[];
  isActive: boolean;
  baseImage?: string;
  targetOpacity?: number;
  playbackRate?: number; // base playback rate (used as fallback)
  crossfadeSeconds?: number;
  muted?: boolean;
  pauseBetweenVideos?: number;
  brightness?: number;
  phase?: Phase | null; // current phase from BreathingCircle (we start only on inhale)
  desiredPlaySeconds?: number; // desired play length for video (e.g. half of cycle)
  maxSpeed?: number; // maximum allowed speed-up factor (e.g. 1.2)
}

export function VideoBackground({
  videoFiles,
  isActive,
  baseImage,
  targetOpacity = 0.35,
  playbackRate = 1,
  crossfadeSeconds = 1.2,
  muted = true,
  pauseBetweenVideos = 2,
  brightness = 0.8,
  phase = null,
  desiredPlaySeconds = 0,
  maxSpeed = 1.2,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playingRef = useRef(false);
  const lastIndexRef = useRef<number | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<number | null>(null);
  const prevPhaseRef = useRef<Phase | null>(null);

  // helper: pick random index != lastIndex
  const pickRandomIndex = () => {
    if (!videoFiles || videoFiles.length === 0) return -1;
    if (videoFiles.length === 1) return 0;
    let idx = Math.floor(Math.random() * videoFiles.length);
    if (lastIndexRef.current == null) {
      lastIndexRef.current = idx;
      return idx;
    }
    let attempts = 0;
    while (idx === lastIndexRef.current && attempts < 6) {
      idx = Math.floor(Math.random() * videoFiles.length);
      attempts++;
    }
    lastIndexRef.current = idx;
    return idx;
  };

  // Compute effective opacity/brightness based on base values and a small factor
  const computeOpacity = (intensity = 1) => {
    // we won't exceed targetOpacity, use intensity to make it stronger during inhale
    return Math.min(1, Math.max(0.04, targetOpacity * (0.6 + 0.8 * intensity)));
  };
  const computeBrightness = (intensity = 1) => {
    return Math.min(2, Math.max(0.3, brightness * (0.85 + 0.9 * intensity)));
  };

  // start one video play (only once per call)
  const startOneVideo = async () => {
    if (!videoFiles || videoFiles.length === 0) return;
    if (playingRef.current) return; // already playing
    const idx = pickRandomIndex();
    if (idx < 0) return;

    const videoEl = videoRef.current;
    if (!videoEl) return;

    playingRef.current = true;
    // clear previous timers
    if (fadeTimeoutRef.current) { window.clearTimeout(fadeTimeoutRef.current); fadeTimeoutRef.current = null; }
    if (pauseTimeoutRef.current) { window.clearTimeout(pauseTimeoutRef.current); pauseTimeoutRef.current = null; }

    // set source and reset
    videoEl.src = videoFiles[idx];
    videoEl.currentTime = 0;
    videoEl.muted = muted;
    videoEl.loop = false;
    videoEl.style.transition = `opacity ${crossfadeSeconds}s ease-in-out, filter ${crossfadeSeconds}s linear`;
    videoEl.style.opacity = "0";
    videoEl.style.visibility = "visible";

    // wait for metadata so we know duration
    const onMeta = () => {
      videoEl.removeEventListener("loadedmetadata", onMeta);
      const clipDuration = videoEl.duration || 0;
      let useRate = playbackRate;

      if (desiredPlaySeconds && desiredPlaySeconds > 0 && clipDuration > 0) {
        // aim to make effective playback time roughly desiredPlaySeconds
        // requiredRate = clipDuration / desiredPlaySeconds
        const requiredRate = clipDuration / desiredPlaySeconds;
        if (requiredRate > 1) {
          // only speed up, but cap
          useRate = Math.min(requiredRate, maxSpeed);
        } else {
          // don't slow down (quality), keep at base playbackRate (or 1)
          useRate = Math.max(0.9, playbackRate);
        }
      }

      videoEl.playbackRate = useRate;
      // start play
      (async () => {
        try { await videoEl.play(); } catch (e) { /* ignore autoplay blocking - video muted should allow autoplay */ }
        // fade in to computed opacity and brightness
        requestAnimationFrame(() => {
          videoEl.style.filter = `brightness(${computeBrightness(1)}) saturate(1.05)`;
          videoEl.style.opacity = String(computeOpacity(1));
        });
       })();
    };

    videoEl.addEventListener("loadedmetadata", onMeta);

    // ended handler
    const onEnded = () => {
      videoEl.removeEventListener("ended", onEnded);
      // fade out gracefully
      videoEl.style.transition = `opacity ${crossfadeSeconds}s ease-in-out`;
      videoEl.style.opacity = "0";
      fadeTimeoutRef.current = window.setTimeout(() => {
        try { videoEl.pause(); } catch {}
        videoEl.currentTime = 0;
        videoEl.style.visibility = "hidden";
        playingRef.current = false;
      }, crossfadeSeconds * 1000);
    };
    videoEl.addEventListener("ended", onEnded);
  };

  // stop current playing immediately (fade out)
  const stopCurrentVideo = () => {
    const el = videoRef.current;
    if (!el) return;
    try {
      el.style.transition = `opacity ${crossfadeSeconds}s ease-out`;
      el.style.opacity = "0";
      if (fadeTimeoutRef.current) window.clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = window.setTimeout(() => {
        try { el.pause(); } catch {}
        el.currentTime = 0;
        el.style.visibility = "hidden";
        playingRef.current = false;
      }, crossfadeSeconds * 1000);
    } catch {}
  };

  // react to phase changes: start on inhale entry only
  useEffect(() => {
    // if phase just changed to inhale, start
    const prev = prevPhaseRef.current;
    if (phase === "inhale" && prev !== "inhale" && isActive) {
      // start one video for this inhale
      startOneVideo();
    }

    // if we enter exhale and a video is playing, let it fade out gracefully
    if (phase === "exhale" && playingRef.current) {
      // optionally start fade earlier to match exhale behavior
      stopCurrentVideo();
    }

    prevPhaseRef.current = phase ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isActive, desiredPlaySeconds, videoFiles]);

  // cleanup
  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) window.clearTimeout(fadeTimeoutRef.current);
      if (pauseTimeoutRef.current) window.clearTimeout(pauseTimeoutRef.current);
    };
  }, []);

  // when isActive toggles off — hide
  useEffect(() => {
    if (!isActive) {
      stopCurrentVideo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-visible z-0">
      {/* base image */}
      {baseImage && (
        <img src={baseImage} className="fixed inset-0 w-full h-full object-cover" alt="background" style={{ filter: `brightness(1.05) contrast(1.03)` }} />
      )}

      {/* single fixed centered video element */}
      <video
        ref={videoRef}
        // cover the viewport, centered, not constrained by parent
        className="fixed top-1/2 left-1/2"
        style={{
          transform: "translate(-50%,-50%)",
          minWidth: "100%",
          minHeight: "100%",
          width: "auto",
          height: "auto",
          objectFit: "cover",
          opacity: 0,
          visibility: "hidden",
          filter: `brightness(${brightness}) saturate(1.05)`,
          transition: `opacity ${crossfadeSeconds}s ease-in-out, filter ${crossfadeSeconds}s linear`,
          zIndex: 0,
        }}
        playsInline
        muted={muted}
        preload="metadata"
      />

      {/* subtle overlay to keep UI readable */}
      <div className="fixed inset-0" style={{ background: "linear-gradient(180deg, rgba(8,12,20,0.12), rgba(6,8,18,0.35))", pointerEvents: "none", zIndex: 5 }} />
    </div>
  );
}
