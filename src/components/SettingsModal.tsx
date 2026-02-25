// src/components/SettingsModal.tsx
import React from "react";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface PhaseDurations {
  inhale: number;
  hold: number;
  exhale: number;
  pause: number;
}

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  phaseDurations: PhaseDurations;
  onChangeDurations: (p: PhaseDurations) => void;
  videoOpacity: number;
  onVideoOpacityChange: (v: number) => void;
  videoSpeed: number;
  onVideoSpeedChange: (v: number) => void;
}

export function SettingsModal({
  open,
  onClose,
  phaseDurations,
  onChangeDurations,
  videoOpacity,
  onVideoOpacityChange,
  videoSpeed,
  onVideoSpeedChange
}: SettingsModalProps) {
  if (!open) return null;
  const update = (k: keyof PhaseDurations, val: number) => onChangeDurations({ ...phaseDurations, [k]: val });

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#071122] rounded-xl p-4 border border-[#23364a] shadow-lg z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-[#AEE6FF]">Session settings</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5"><X className="w-5 h-5" /></button>
        </div>

        {/* phase sliders small */}
        {(["inhale","hold","exhale","pause"] as (keyof PhaseDurations)[]).map(k => (
          <div key={k} className="mb-3">
            <div className="flex justify-between text-xs text-[#88BEE5] mb-1">
              <span>{k[0].toUpperCase() + k.slice(1)}</span>
              <span className="text-sm text-[#CDEEFF]">{phaseDurations[k]}s</span>
            </div>
            <Slider value={[phaseDurations[k]]} min={1} max={12} step={1} onValueChange={(v:number[]) => update(k, v[0])} />
          </div>
        ))}

        {/* video opacity */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-[#88BEE5] mb-1">
            <span>Background opacity</span>
            <span className="text-sm text-[#CDEEFF]">{Math.round(videoOpacity*100)}%</span>
          </div>
          <Slider value={[videoOpacity]} min={0} max={1} step={0.05} onValueChange={(v:number[]) => onVideoOpacityChange(v[0])} />
        </div>

        {/* playback rate */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-[#88BEE5] mb-1">
            <span>Video speed</span>
            <span className="text-sm text-[#CDEEFF]">{videoSpeed}x</span>
          </div>
          <Slider value={[videoSpeed]} min={0.25} max={1.5} step={0.05} onValueChange={(v:number[]) => onVideoSpeedChange(v[0])} />
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
