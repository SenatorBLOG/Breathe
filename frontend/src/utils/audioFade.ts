// src/utils/audioFade.ts
//
// Smooth volume ramp for an HTMLAudioElement. Sudden play/pause on meditation
// audio is jarring; a 250–400ms fade preserves the calm atmosphere.

export type FadeDirection = 'in' | 'out';

export function fadeAudio(
  el: HTMLAudioElement | null,
  direction: FadeDirection,
  target: number,
  durationMs = 350,
): Promise<void> {
  return new Promise(resolve => {
    if (!el) return resolve();
    const clamped = Math.max(0, Math.min(1, target));
    const start = direction === 'in' ? 0 : el.volume;
    const end   = direction === 'in' ? clamped : 0;
    if (direction === 'in') el.volume = 0;
    const startTs = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - startTs) / durationMs);
      el.volume = start + (end - start) * t;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        el.volume = end;
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}
