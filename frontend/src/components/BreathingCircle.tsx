// src/components/BreathingCircle.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export type Phase = "inhale" | "hold" | "exhale" | "pause";

interface PhaseDurations {
  inhale: number;
  hold: number;
  exhale: number;
  pause: number;
}

interface BreathingCircleProps {
  isActive: boolean;
  phaseDurations: PhaseDurations;
  onCycleComplete?: () => void;
  onPhaseChange?: (phase: Phase, intensity: number) => void;
  onToggle?: () => void;
  size?: number;
  minScale?: number;
  maxScale?: number;
  glowIntensity?: number;
}

export function BreathingCircle({
  isActive,
  phaseDurations,
  onCycleComplete,
  onPhaseChange,
  onToggle,
  size = 520,
  minScale = 0.72,
  maxScale = 1.1,    // ← reduced from 1.12 so expansion stays within the container
  glowIntensity = 1,
}: BreathingCircleProps) {
  const controls  = useAnimation();
  const [phase, setPhase] = useState<Phase>("inhale");
  const timeoutRef = useRef<number | null>(null);

  const intensityByPhase: Record<Phase, number> = {
    inhale: 1.0, hold: 0.92, exhale: 0.45, pause: 0.36,
  };

  // Cleanup on unmount
  useEffect(() => () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); }, []);

  useEffect(() => {
    if (timeoutRef.current) { window.clearTimeout(timeoutRef.current); timeoutRef.current = null; }

    if (!isActive) {
      controls.start({ scale: 1, boxShadow: "0 16px 80px rgba(20,40,80,0.12)", transition: { duration: 0.6, ease: "easeOut" } });
      setPhase("inhale");
      onPhaseChange?.("inhale", intensityByPhase["inhale"]);
      return;
    }

    const order: Phase[] = ["inhale", "hold", "exhale", "pause"];

    const runPhase = (p: Phase) => {
      setPhase(p);
      onPhaseChange?.(p, intensityByPhase[p]);

      const expanding = p === "inhale" || p === "hold";
      const targetScale = expanding ? maxScale : minScale;
      const glowFactor  = expanding ? 1.0 * glowIntensity : 0.5 * glowIntensity;

      controls.start({
        scale: targetScale,
        boxShadow: `
          0 40px 180px rgba(80,170,255,${0.12 * glowFactor}),
          inset 0 0 80px rgba(255,255,255,${0.03 * glowFactor})
        `,
        transition: { duration: phaseDurations[p], ease: "easeInOut" },
      });

      timeoutRef.current = window.setTimeout(() => {
        if (p === "pause") onCycleComplete?.();
        runPhase(order[(order.indexOf(p) + 1) % order.length]);
      }, Math.max(50, Math.round(phaseDurations[p] * 1000)));
    };

    runPhase(phase);

    return () => { if (timeoutRef.current) { window.clearTimeout(timeoutRef.current); timeoutRef.current = null; } };
  }, [isActive, phaseDurations, glowIntensity, minScale, maxScale]);

  const LABEL: Record<Phase, string> = {
    inhale: "Inhale", hold: "Hold", exhale: "Exhale", pause: "Pause",
  };

  const sizePx = `${size}px`;

  return (
    <div className="relative flex items-center justify-center" style={{ width: sizePx, height: sizePx }}>
      <motion.div
        animate={controls}
        initial={{ scale: 1 }}
        whileHover={{ scale: isActive ? undefined : 1.03, filter: "brightness(1.06)" }}
        whileTap={{ scale: 0.97, filter: "brightness(1.15)" }}
        onClick={onToggle}
        style={{
          width: sizePx,
          height: sizePx,
          borderRadius: "9999px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `
            radial-gradient(
              rgba(112,184,255,0.35) 20%,
              rgba(101,168,255,0.7)  80%,
              rgba(112,184,255,1)    36%,
              rgba(255,255,255,1)   100%
            )
          `,
          border: "1px solid rgba(112,184,255,1)",
          boxShadow: "0 0 120px rgba(80,170,255,0.15)",
        }}
      >
        <div className="relative z-20 text-center select-none pointer-events-none">
          <div style={{
            color: "#fff",
            fontSize: "clamp(24px, 5.2vw, 68px)",
            fontWeight: 800,
            textShadow: "0 10px 36px rgba(90,170,255,0.3)",
            lineHeight: 1,
          }}>
            {isActive ? LABEL[phase] : "Start"}
          </div>
          <div style={{
            color: "rgba(220,235,255,0.9)",
            marginTop: 8,
            fontSize: "clamp(11px, 1.5vw, 18px)",
          }}>
            {isActive ? `${Math.round(phaseDurations[phase])}s` : "Tap to begin"}
          </div>
        </div>
      </motion.div>
    </div>
  );
}