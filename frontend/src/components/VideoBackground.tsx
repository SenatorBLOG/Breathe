// src/components/VideoBackground.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Phase } from './BreathingCircle';

interface VideoBackgroundProps {
  videoFiles:          string[];
  isActive:            boolean;
  baseImage?:          string;
  targetOpacity?:      number;
  playbackRate?:       number;
  crossfadeSeconds?:   number;
  muted?:              boolean;
  brightness?:         number;
  phase?:              Phase | null;
  desiredPlaySeconds?: number;
  maxSpeed?:           number;
  pauseBetweenVideos?: number; // kept for API compatibility, ignored
}

export function VideoBackground({
  videoFiles,
  isActive,
  baseImage,
  targetOpacity      = 0.45,
  playbackRate       = 1,
  crossfadeSeconds   = 1.5,
  muted              = true,
  brightness         = 1.0,
  phase              = null,
  desiredPlaySeconds = 0,
  maxSpeed           = 1.2,
}: VideoBackgroundProps) {

  const videoRef     = useRef<HTMLVideoElement | null>(null);
  const playingRef   = useRef(false);
  const lastIndexRef = useRef<number>(-1);
  const fadeTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPhaseRef = useRef<Phase | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError,  setImgError]  = useState(false);

  // ── Pick a random video, avoiding the last one ────────────────────────────
  const pickIndex = useCallback((): number => {
    if (!videoFiles.length) return -1;
    if (videoFiles.length === 1) return 0;
    let idx = Math.floor(Math.random() * videoFiles.length);
    let tries = 0;
    while (idx === lastIndexRef.current && tries++ < 8) {
      idx = Math.floor(Math.random() * videoFiles.length);
    }
    lastIndexRef.current = idx;
    return idx;
  }, [videoFiles]);

  // ── Fade video out and stop ────────────────────────────────────────────────
  const fadeOut = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    el.style.transition = `opacity ${crossfadeSeconds}s ease-out`;
    el.style.opacity    = '0';
    fadeTimer.current   = setTimeout(() => {
      try { el.pause(); } catch {}
      el.removeAttribute('src');
      el.load();                      // release memory
      el.style.visibility = 'hidden';
      playingRef.current  = false;
    }, crossfadeSeconds * 1000);
  }, [crossfadeSeconds]);

  // ── Start one video clip ───────────────────────────────────────────────────
  const fadeIn = useCallback(async () => {
    if (playingRef.current) return;   // already playing — skip
    if (!videoFiles.length) return;

    const idx = pickIndex();
    if (idx < 0) return;

    const el = videoRef.current;
    if (!el) return;

    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    playingRef.current  = true;
    el.style.visibility = 'visible';
    el.style.opacity    = '0';
    el.style.transition = 'none';

    el.src         = videoFiles[idx];
    el.muted       = muted;
    el.loop        = false;
    el.currentTime = 0;

    // Set playback rate once duration is known
    const onMeta = () => {
      el.removeEventListener('loadedmetadata', onMeta);
      let rate = playbackRate;
      if (desiredPlaySeconds > 0 && el.duration > 0) {
        const needed = el.duration / desiredPlaySeconds;
        rate = needed > 1 ? Math.min(needed, maxSpeed) : playbackRate;
      }
      el.playbackRate = rate;
    };
    el.addEventListener('loadedmetadata', onMeta);

    // When video ends — fade out
    const onEnded = () => {
      el.removeEventListener('ended', onEnded);
      fadeOut();
    };
    el.addEventListener('ended', onEnded);

    // iOS/Android: explicit load() before play()
    el.load();
    try {
      await el.play();
    } catch {
      // Autoplay blocked (Low Power Mode etc.) — hide cleanly
      playingRef.current  = false;
      el.style.visibility = 'hidden';
      return;
    }

    // Fade in after two rAF frames to ensure first paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `opacity ${crossfadeSeconds}s ease-in, filter ${crossfadeSeconds}s linear`;
        el.style.opacity    = String(targetOpacity);
        el.style.filter     = `brightness(${brightness}) saturate(1.05)`;
      });
    });
  }, [videoFiles, pickIndex, fadeOut, muted, playbackRate, desiredPlaySeconds,
      maxSpeed, crossfadeSeconds, targetOpacity, brightness]);

  // ── Sync with breathing phases ─────────────────────────────────────────────
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase ?? null;
    if (!isActive) return;

    if (phase === 'inhale' && prev !== 'inhale') {
      fadeIn();
    }
    if (phase === 'pause' && prev !== 'pause' && playingRef.current) {
      fadeOut();
    }
  }, [phase, isActive, fadeIn, fadeOut]);

  // ── Stop when session stops ────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) fadeOut();
  }, [isActive, fadeOut]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      const el = videoRef.current;
      if (el) { try { el.pause(); } catch {} }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Base image */}
      {baseImage && !imgError && (
        <img
          src={baseImage}
          alt=""
          aria-hidden="true"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          style={{
            position:   'absolute',
            inset:      0,
            width:      '100%',
            height:     '100%',
            objectFit:  'cover',
            opacity:    imgLoaded ? 1 : 0,
            filter:     `brightness(${brightness})`,
            transition: 'opacity 0.5s ease',
          }}
        />
      )}

      {/*
        Video — mobile-safe layout:
        - position: absolute (NOT fixed — fixed breaks on iOS Safari during scroll)
        - width/height: 100% + objectFit: cover (NOT minWidth/minHeight + transform)
        - playsInline: required on iOS to prevent forced fullscreen
        - muted: required for autoplay on iOS/Android
      */}
      <video
        ref={videoRef}
        playsInline
        muted
        preload="metadata"
        style={{
          position:   'absolute',
          top:        0,
          left:       0,
          width:      '100%',
          height:     '100%',
          objectFit:  'cover',
          opacity:    0,
          visibility: 'hidden',
          filter:     `brightness(${brightness}) saturate(1.05)`,
        }}
      />

      {/* Vignette overlay */}
      <div
        style={{
          position:      'absolute',
          inset:         0,
          background:    'radial-gradient(ellipse at center, transparent 20%, rgba(1,8,20,0.55) 100%)',
          pointerEvents: 'none',
          zIndex:        1,
        }}
      />
    </div>
  );
}
