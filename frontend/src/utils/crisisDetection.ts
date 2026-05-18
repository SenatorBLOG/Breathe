// src/utils/crisisDetection.ts
//
// Frontend safety-net: detect suicidal ideation / self-harm / crisis language
// in user messages BEFORE they are sent to the AI Coach backend. When detected,
// the UI must show the CrisisHelp modal with regional helpline numbers instead
// of forwarding the message to the LLM. This is a mental-health-app hard
// requirement — never let an AI improvise a response to a suicide-risk message.
//
// English + Russian + Spanish keyword/phrase coverage. False positives are
// preferable to false negatives for this check; an extra helpline screen is
// never harmful, but missing one can be fatal.
//
// IMPORTANT: JavaScript's `\b` is ASCII-only — it does not recognise Cyrillic
// (or other non-Latin) letters as word characters, so `\bпокончить\b` NEVER
// matches in normal Russian text. We use Unicode property escapes `\p{L}` in
// look-arounds (requires the `u` flag) so word boundaries work for all scripts.

// Unicode-aware word boundary equivalents.
const LB = '(?<!\\p{L})';  // before: not preceded by a letter
const RB = '(?!\\p{L})';   // after: not followed by a letter

// Helper: build a unicode-boundary-aware case-insensitive regex.
const re = (pat: string) => new RegExp(`${LB}(?:${pat})${RB}`, 'iu');

const PATTERNS: RegExp[] = [
  // English — direct ideation
  re('kill\\s+(?:my ?self|me)'),
  re('suicid(?:e|al|ing)'),
  re('end\\s+(?:my\\s+life|it\\s+all)'),
  re('take\\s+my\\s+(?:own\\s+)?life'),
  re('(?:want|wanna|going)\\s+to\\s+die'),
  re('self[- ]?harm'),
  re('cut(?:ting)?\\s+my(?:self)?'),
  re('hurt\\s+my ?self'),
  re('overdose'),
  re('no\\s+(?:reason|point)\\s+to\\s+(?:live|continue)'),
  re('better\\s+off\\s+(?:dead|without\\s+me)'),
  re("can'?t\\s+(?:go\\s+on|do\\s+this\\s+anymore|take\\s+it\\s+anymore)"),

  // Russian — direct ideation
  re('покончить\\s+(?:с\\s+собой|жизнь|жизнью)'),
  re('самоубий(?:ство|ца)'),
  re('хочу\\s+(?:умереть|сдохнуть)'),
  re('убить\\s+себя'),
  re('убью\\s+себя'),
  re('порезать(?:ся)?'),
  re('причинить\\s+(?:себе\\s+)?вред'),
  re('нет\\s+смысла\\s+жить'),
  re('жить\\s+не\\s+хочется'),

  // Spanish — direct ideation
  re('suicid(?:arme|io|arse|a)'),
  re('quiero\\s+morir(?:me)?'),
  re('matar(?:me|se)'),
  re('quitar(?:me|se)\\s+la\\s+vida'),
  re('hacerme\\s+da[ñn]o'),
  re('autolesi[oó]n'),
];

/**
 * Returns true if the message contains language suggesting suicidal ideation,
 * self-harm intent, or acute mental-health crisis.
 *
 * Intentionally biased toward false positives. A user briefly seeing a
 * helpline-resources screen they didn't need is acceptable. A user in crisis
 * being met with a breathing-technique tip is not.
 */
export function detectCrisis(message: string): boolean {
  if (!message || typeof message !== 'string') return false;
  const text = message.trim();
  if (text.length < 3) return false;
  return PATTERNS.some(re => re.test(text));
}
