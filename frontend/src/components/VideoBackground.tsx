// src/components/VideoBackground.tsx
import React, { useEffect, useRef, useState } from "react";
import type { Phase } from "./BreathingCircle";

interface VideoBackgroundProps {
  videoFiles: string[];
  isActive: boolean;
  baseImage?: string;
  targetOpacity?: number;
  playbackRate?: number;
  crossfadeSeconds?: number;
  muted?: boolean;
  pauseBetweenVideos?: number;
  brightness?: number;
  phase?: Phase | null;
  desiredPlaySeconds?: number;
  maxSpeed?: number;
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
  const videoRef        = useRef<HTMLVideoElement | null>(null);
  const playingRef      = useRef(false);
  const lastIndexRef    = useRef<number | null>(null);
  const fadeTimeoutRef  = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<number | null>(null);
  const prevPhaseRef    = useRef<Phase | null>(null);
  // Track if base image loaded successfully
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError,  setImgError]  = useState(false);

  const pickRandomIndex = () => {
    if (!videoFiles || videoFiles.length === 0) return -1;
    if (videoFiles.length === 1) return 0;
    let idx = Math.floor(Math.random() * videoFiles.length);
    if (lastIndexRef.current == null) { lastIndexRef.current = idx; return idx; }
    let attempts = 0;
    while (idx === lastIndexRef.current && attempts < 6) {
      idx = Math.floor(Math.random() * videoFiles.length);
      attempts++;
    }
    lastIndexRef.current = idx;
    return idx;
  };

  const computeOpacity    = (intensity = 1) => Math.min(1, Math.max(0.04, targetOpacity * (0.6 + 0.8 * intensity)));
  const computeBrightness = (intensity = 1) => Math.min(2, Math.max(0.3, brightness * (0.85 + 0.9 * intensity)));

  const startOneVideo = async () => {
    if (!videoFiles || videoFiles.length === 0) return;
    if (playingRef.current) return;
    const idx = pickRandomIndex();
    if (idx < 0) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    playingRef.current = true;
    if (fadeTimeoutRef.current)  { window.clearTimeout(fadeTimeoutRef.current);  fadeTimeoutRef.current  = null; }
    if (pauseTimeoutRef.current) { window.clearTimeout(pauseTimeoutRef.current); pauseTimeoutRef.current = null; }

    videoEl.src = videoFiles[idx];
    videoEl.currentTime = 0;
    videoEl.muted = muted;
    videoEl.loop = false;
    videoEl.style.transition = `opacity ${crossfadeSeconds}s ease-in-out, filter ${crossfadeSeconds}s linear`;
    videoEl.style.opacity = "0";
    videoEl.style.visibility = "visible";

    const onMeta = () => {
      videoEl.removeEventListener("loadedmetadata", onMeta);
      const clipDuration = videoEl.duration || 0;
      let useRate = playbackRate;
      if (desiredPlaySeconds && desiredPlaySeconds > 0 && clipDuration > 0) {
        const requiredRate = clipDuration / desiredPlaySeconds;
        useRate = requiredRate > 1 ? Math.min(requiredRate, maxSpeed) : Math.max(0.9, playbackRate);
      }
      videoEl.playbackRate = useRate;
      (async () => {
        try { await videoEl.play(); } catch {}
        requestAnimationFrame(() => {
          videoEl.style.filter  = `brightness(${computeBrightness(1)}) saturate(1.05)`;
          videoEl.style.opacity = String(computeOpacity(1));
        });
      })();
    };
    videoEl.addEventListener("loadedmetadata", onMeta);

    const onEnded = () => {
      videoEl.removeEventListener("ended", onEnded);
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

  useEffect(() => {
    const prev = prevPhaseRef.current;
    if (phase === "inhale" && prev !== "inhale" && isActive) startOneVideo();
    if (phase === "exhale" && playingRef.current) stopCurrentVideo();
    prevPhaseRef.current = phase ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isActive, desiredPlaySeconds, videoFiles]);

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current)  window.clearTimeout(fadeTimeoutRef.current);
      if (pauseTimeoutRef.current) window.clearTimeout(pauseTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isActive) stopCurrentVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-visible z-0">

      {/* Base image — only render if path provided, hide on error */}
      {baseImage && !imgError && (
        <img
          src={baseImage}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          className="fixed inset-0 w-full h-full object-cover"
          alt=""                          // ← empty alt = decorative, no broken text
          aria-hidden="true"              // ← screen readers skip it
          style={{
            opacity:    imgLoaded ? 1 : 0, // don't flash broken icon while loading
            filter:     'brightness(1.05) contrast(1.03)',
            transition: 'opacity 0.5s ease',
          }}
        />
      )}

      {/* Single video element */}
      <video
        ref={videoRef}
        className="fixed top-1/2 left-1/2"
        style={{
          transform: "translate(-50%,-50%)",
          minWidth: "100%", minHeight: "100%",
          width: "auto",    height: "auto",
          objectFit: "cover",
          opacity: 0, visibility: "hidden",
          filter: `brightness(${brightness}) saturate(1.05)`,
          transition: `opacity ${crossfadeSeconds}s ease-in-out, filter ${crossfadeSeconds}s linear`,
          zIndex: 0,
        }}
        playsInline
        muted={muted}
        preload="metadata"
      />

      {/* Overlay */}
      <div className="fixed inset-0" style={{
        background: "linear-gradient(180deg, rgba(8,12,20,0.12), rgba(6,8,18,0.35))",
        pointerEvents: "none", zIndex: 5,
      }} />
    </div>
  );
}