// Regression suite for the multi-script crisis detector.
//
// History: the original implementation used `\b` word boundaries, which are
// ASCII-only in JavaScript — every Russian pattern silently never matched.
// These tests pin the Unicode-aware behaviour so that bug can't return.
import { describe, it, expect } from 'vitest';
import { detectCrisis } from './crisisDetection';

describe('detectCrisis — English', () => {
  it.each([
    'I want to die',
    'i keep thinking about suicide',
    'I am going to kill myself',
    "I can't go on",
    'sometimes I think about self-harm',
    'thinking of self harm again',
    'there is no point to live',
    'everyone would be better off without me',
  ])('flags: %s', (msg) => {
    expect(detectCrisis(msg)).toBe(true);
  });

  it.each([
    'my day was fine, just a bit stressed',
    'work is killing my schedule this week', // "kill" without self-reference
    'I want to improve my sleep',
    'the deadline is brutal but I can handle it',
  ])('passes benign: %s', (msg) => {
    expect(detectCrisis(msg)).toBe(false);
  });
});

describe('detectCrisis — Russian (the \\b regression)', () => {
  // Every one of these returned FALSE with the old ASCII-\b patterns.
  it.each([
    'хочу умереть',
    'я хочу сдохнуть',
    'думаю покончить с собой',
    'хочу убить себя',
    'нет смысла жить',
    'мне жить не хочется',
    'я больше не могу, хочу умереть.',
    'ХОЧУ УМЕРЕТЬ', // case-insensitive across scripts
  ])('flags: %s', (msg) => {
    expect(detectCrisis(msg)).toBe(true);
  });

  it.each([
    'сегодня тяжёлый день, но я справлюсь',
    'хочу спать и отдохнуть',
    'помоги мне расслабиться перед сном',
  ])('passes benign: %s', (msg) => {
    expect(detectCrisis(msg)).toBe(false);
  });
});

describe('detectCrisis — Spanish', () => {
  it.each([
    'quiero morirme',
    'quiero matarme',
    'pienso en el suicidio',
    'quiero hacerme daño',
    'pensando en la autolesión',
  ])('flags: %s', (msg) => {
    expect(detectCrisis(msg)).toBe(true);
  });

  it('passes benign Spanish', () => {
    expect(detectCrisis('estoy un poco estresado hoy')).toBe(false);
  });
});

describe('detectCrisis — input edge cases', () => {
  it('rejects empty and junk input without throwing', () => {
    expect(detectCrisis('')).toBe(false);
    expect(detectCrisis('   ')).toBe(false);
    expect(detectCrisis('ok')).toBe(false);
    // @ts-expect-error — runtime guard against non-string input
    expect(detectCrisis(null)).toBe(false);
    // @ts-expect-error — runtime guard against non-string input
    expect(detectCrisis(undefined)).toBe(false);
  });

  it('does not flag words that merely contain a pattern inside them', () => {
    // 'overdose' inside a longer token must not fire thanks to \p{L} boundaries
    expect(detectCrisis('the overdoser9000 is my gamer tag')).toBe(false);
  });
});
