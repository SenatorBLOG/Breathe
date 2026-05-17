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

const PATTERNS: RegExp[] = [
  // English — direct ideation
  /\bkill\s+(my ?self|me)\b/i,
  /\bsuicid(e|al|ing)\b/i,
  /\bend\s+(my\s+life|it\s+all)\b/i,
  /\btake\s+my\s+(own\s+)?life\b/i,
  /\b(want|wanna|going)\s+to\s+die\b/i,
  /\bi\s+want\s+to\s+die\b/i,
  /\bself[- ]?harm/i,
  /\bcut(ting)?\s+my(self)?\b/i,
  /\bhurt\s+my ?self\b/i,
  /\boverdose\b/i,
  /\bno\s+(reason|point)\s+to\s+(live|continue)\b/i,
  /\bbetter\s+off\s+(dead|without\s+me)\b/i,
  /\bcan'?t\s+(go\s+on|do\s+this\s+anymore|take\s+it\s+anymore)\b/i,

  // Russian — direct ideation
  /\bпокончить\s+(с\s+собой|жизнь|жизнью)\b/i,
  /\bсамоубий(ство|ца)\b/i,
  /\bхочу\s+(умереть|сдохнуть)\b/i,
  /\b(убить|убью|убью\s+себя)\b/i,
  /\bпорезать(ся)?\b/i,
  /\bпричинить\s+(себе\s+)?вред\b/i,
  /\bнет\s+смысла\s+жить\b/i,

  // Spanish — direct ideation
  /\bsuicid(arme|io|arse|a)\b/i,
  /\bquiero\s+morir(me)?\b/i,
  /\bmatar(me|se)\b/i,
  /\bquitar(me|se)\s+la\s+vida\b/i,
  /\bhacerme\s+da[ñn]o\b/i,
  /\bautolesi[oó]n\b/i,
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
