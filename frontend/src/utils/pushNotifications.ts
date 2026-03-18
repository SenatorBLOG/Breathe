// src/utils/pushNotifications.ts

export type PushPermission = 'granted' | 'denied' | 'default' | 'unsupported';

// ─── Check support & status ───────────────────────────────────────────────────
export function getPushPermission(): PushPermission {
  if (typeof window === 'undefined') return 'unsupported';
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported';
  return Notification.permission as PushPermission;
}

// ─── Request permission ───────────────────────────────────────────────────────
export async function requestPushPermission(): Promise<PushPermission> {
  if (getPushPermission() === 'unsupported') return 'unsupported';
  const result = await Notification.requestPermission();
  return result as PushPermission;
}

// ─── Send local notification (no server needed) ───────────────────────────────
export function sendLocalNotification(title: string, options?: NotificationOptions) {
  if (getPushPermission() !== 'granted') return;
  try {
    new Notification(title, {
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      ...options,
    });
  } catch (err) {
    console.warn('Notification failed:', err);
  }
}

// ─── Schedule reminder (setTimeout based — works while tab is open) ───────────
const scheduledTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

export function scheduleReminder(
  id: string,
  delayMs: number,
  title: string,
  body: string
) {
  // Cancel existing with same id
  clearReminder(id);

  const t = setTimeout(() => {
    sendLocalNotification(title, { body, tag: id });
    scheduledTimers.delete(id);
  }, delayMs);

  scheduledTimers.set(id, t);
}

export function clearReminder(id: string) {
  const t = scheduledTimers.get(id);
  if (t) { clearTimeout(t); scheduledTimers.delete(id); }
}

// ─── Smart reminder schedules ─────────────────────────────────────────────────

// Remind user who hasn't meditated today
export function scheduleStreakReminder(streakDays: number) {
  const hour = new Date().getHours();
  // Schedule for 7pm if morning, 9pm if afternoon
  const targetHour = hour < 14 ? 19 : 21;
  const now = new Date();
  const target = new Date();
  target.setHours(targetHour, 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);

  const delay = target.getTime() - now.getTime();
  const msg = streakDays > 0
    ? `🔥 ${streakDays}-day streak at risk — 5 minutes to keep it alive`
    : `🌊 Time to breathe — your daily session is waiting`;

  scheduleReminder('daily_streak', delay, 'Breathe', msg);
}

// Remind after session to review calm score
export function schedulePostSessionReminder(calmScore: number) {
  scheduleReminder(
    'post_session',
    3600000, // 1 hour later
    'How are you feeling?',
    `Your Calm Score was ${calmScore} — have you noticed the difference? 🌊`
  );
}

// HRV-based morning recommendation
export function sendMorningRecommendation(recoveryScore: number) {
  const msg = recoveryScore >= 75
    ? `⚡ Recovery: ${recoveryScore}/100 — great day for Wim Hof breathing`
    : recoveryScore >= 50
    ? `🌊 Recovery: ${recoveryScore}/100 — Box Breathing recommended today`
    : `💙 Recovery: ${recoveryScore}/100 — gentle 4-7-8 will help you restore`;

  sendLocalNotification('Your morning breathing recommendation', { body: msg, tag: 'morning_rec' });
}