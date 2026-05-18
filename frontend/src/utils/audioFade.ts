// src/utils/audioFade.ts
//
// Smooth volume ramp for an HTMLAudioElement. Sudden play/pause on meditation
// audio is jarring; a 250–400ms fade preserves the calm atmosphere.
//
// We attach a generation token to each element so a rapid play→pause→play
// sequence cancels the previous fade — otherwise two rAF loops fight over
// `el.volume` and the older fade's `.then()` can fire `el.pause()` after the
// user has already started playing again.

export type FadeDirection = 'in' | 'out';

interface AudioWithFade extends HTMLAudioElement {
  __fadeGen?: number;
}

export function fadeAudio(
  el: HTMLAudioElement | null,
  direction: FadeDirection,
  target: number,
  durationMs = 350,
): Promise<void> {
  return new Promise(resolve => {
    if (!el) return resolve();
    const elx = el as AudioWithFade;
    // Bump generation — any in-flight fade for this element will see a
    // stale token on its next frame and bail out.
    const gen = (elx.__fadeGen ?? 0) + 1;
    elx.__fadeGen = gen;

    const clamped = Math.max(0, Math.min(1, target));
    const start = direction === 'in' ? 0 : el.volume;
    const end   = direction === 'in' ? clamped : 0;
    if (direction === 'in') el.volume = 0;
    const startTs = performance.now();

    const step = (now: number) => {
      // A newer fade started — abandon this one (do NOT resolve, so the
      // caller's `.then()` never runs and can't fire stale side effects).
      if (elx.__fadeGen !== gen) return;
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
