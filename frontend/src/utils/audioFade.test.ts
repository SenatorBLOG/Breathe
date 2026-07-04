// Tests for the generation-token fade cancellation.
//
// History: two overlapping fades used to fight over `el.volume`, and the older
// fade's `.then()` could pause audio the user had just restarted. The fix
// abandons a fade (without resolving) when a newer one begins.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fadeAudio } from './audioFade';

// Minimal fake rAF loop we can advance frame by frame.
let rafQueue: FrameRequestCallback[] = [];
let clock = 0;

function advanceFrames(stepMs: number, frames: number) {
  for (let i = 0; i < frames; i++) {
    clock += stepMs;
    const batch = rafQueue;
    rafQueue = [];
    for (const cb of batch) cb(clock);
  }
}

// Let pending promise callbacks (.then) run.
const flushMicrotasks = () => new Promise<void>(r => setTimeout(r, 0));

beforeEach(() => {
  rafQueue = [];
  clock = 0;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    rafQueue.push(cb);
    return rafQueue.length;
  });
  vi.stubGlobal('performance', { now: () => clock });
});

// fadeAudio only touches .volume and its private token — a bare object is a
// perfectly good stand-in for an HTMLAudioElement here.
const makeEl = (volume = 1) => ({ volume } as unknown as HTMLAudioElement);

describe('fadeAudio', () => {
  it('resolves immediately for a null element', async () => {
    await expect(fadeAudio(null, 'in', 1)).resolves.toBeUndefined();
  });

  it('fades in from 0 to the target and resolves', async () => {
    const el = makeEl(1);
    let done = false;
    fadeAudio(el, 'in', 0.8, 100).then(() => { done = true; });

    expect(el.volume).toBe(0);          // fade-in starts from silence
    advanceFrames(50, 1);               // halfway
    expect(el.volume).toBeGreaterThan(0.3);
    expect(el.volume).toBeLessThan(0.8);

    advanceFrames(60, 1);               // past the end
    await flushMicrotasks();
    expect(el.volume).toBe(0.8);
    expect(done).toBe(true);
  });

  it('fades out to zero', async () => {
    const el = makeEl(0.9);
    const p = fadeAudio(el, 'out', 0, 100);
    advanceFrames(120, 1);
    await p;
    expect(el.volume).toBe(0);
  });

  it('abandons a superseded fade: no resolution, no volume fighting', async () => {
    const el = makeEl(1);
    let staleResolved = false;

    // Start a fade-out…
    fadeAudio(el, 'out', 0, 200).then(() => { staleResolved = true; });
    advanceFrames(50, 1); // partially faded down

    // …then the user hits play again: a fade-in supersedes it.
    let freshResolved = false;
    fadeAudio(el, 'in', 1, 100).then(() => { freshResolved = true; });

    advanceFrames(60, 2); // enough frames to finish the fresh fade
    await flushMicrotasks();

    expect(freshResolved).toBe(true);
    expect(el.volume).toBe(1);          // fresh fade owns the volume
    expect(staleResolved).toBe(false);  // stale fade never resolved → no stale pause()
  });

  it('clamps the target into [0, 1]', async () => {
    const el = makeEl(0);
    const p = fadeAudio(el, 'in', 5, 50);
    advanceFrames(60, 1);
    await p;
    expect(el.volume).toBe(1);
  });
});
