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
  minScale = 0.7,
  maxScale = 1.12,
  glowIntensity = 1,
}: BreathingCircleProps) {
  const controls = useAnimation();
  const [phase, setPhase] = useState<Phase>("inhale");
  const timeoutRef = useRef<number | null>(null);
  const [cycleCount, setCycleCount] = useState(0);

  const intensityByPhase: Record<Phase, number> = {
    inhale: 1.0,
    hold: 0.92,
    exhale: 0.45,
    pause: 0.36,
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!isActive) {
      controls.start({
        scale: 1,
        boxShadow: `0 16px 80px rgba(20,40,80,0.12)`,
        transition: { duration: 0.6, ease: "easeOut" },
      });
      setPhase("inhale");
      setCycleCount(0); // reset cycle count on pause/stop
      onPhaseChange?.("inhale", intensityByPhase["inhale"]);
      return;
    }

    const order: Phase[] = ["inhale", "hold", "exhale", "pause"];

    const runPhase = (p: Phase) => {
      setPhase(p);
      const intensity = intensityByPhase[p];
      onPhaseChange?.(p, intensity);

      const expanding = p === "inhale" || p === "hold";
      const targetScale = expanding ? maxScale : minScale;
      const glowFactor = expanding ? 1.0 * glowIntensity : 0.5 * glowIntensity;

      const shadow = `
        0 40px 180px rgba(80,170,255,${0.12 * glowFactor}),
        inset 0 0 80px rgba(255,255,255,${0.03 * glowFactor})
      `;

      controls.start({
        scale: targetScale,
        boxShadow: shadow,
        transition: { duration: phaseDurations[p], ease: "easeInOut" },
      });

      timeoutRef.current = window.setTimeout(() => {
        if (p === "pause") {
          setCycleCount((c) => c + 1);
          onCycleComplete?.();
        }
        const next = order[(order.indexOf(p) + 1) % order.length];
        runPhase(next);
      }, Math.max(50, Math.round(phaseDurations[p] * 1000)));
    };

    runPhase(phase);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isActive, phaseDurations, glowIntensity, minScale, maxScale]);

  const label = {
    inhale: "Inhale",
    hold: "Hold",
    exhale: "Exhale",
    pause: "Pause",
  }[phase];

  const sizePx = `${size}px`;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: sizePx, height: sizePx }}
    >
      {/*  CIRCLE  */}
      <motion.div
        animate={controls}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.03, filter: "brightness(1.06)" }}
        whileTap={{ scale: 0.97, filter: "brightness(1.15)" }}
        onClick={onToggle} //  
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
              rgba(101,168,255,0.7) 80%,
              rgba(112,184,255,1) 36%,
              rgba(255,255,255,1) 100%
            )
          `,
          border: "1px solid rgba(112,184,255,1)",
          boxShadow: `0 0 120px rgba(80,170,255,0.15)`,
          transition: "all 0.3s ease-in-out",
        }}
      >
        {/*  Text  */}
        <div className="relative z-20 text-center select-none">
          <div
            style={{
              color: "#fff",
              fontSize: "clamp(28px, 5.6vw, 72px)",
              fontWeight: 800,
              textShadow: "0 10px 36px rgba(90,170,255,0.3)",
              lineHeight: 1,
            }}
          >
            {isActive ? label : "Start"}
          </div>

          <div
            style={{
              color: "rgba(220,235,255,0.95)",
              marginTop: 8,
              fontSize: "clamp(12px,1.6vw,20px)",
            }}
          >
            {isActive ? `${Math.round(phaseDurations[phase])}s` : "Ready"}
          </div>
        </div>
      </motion.div>

      {/*  Cicle count  */}
      <div
        style={{
          position: "absolute",
          bottom: -48,
          color: "rgba(220,235,255,0.9)",
        }}
      >
        {isActive ? `Cycle ${cycleCount + 1}` : ""}
      </div>
    </div>
  );
}