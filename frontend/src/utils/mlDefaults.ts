// src/utils/mlDefaults.ts
// Central helper for ML recommendation defaults derived from user goal + time of day.
// Used by Onboarding (save) and NewSessionPage (read).

export type UserGoal = 'sleep' | 'stress' | 'focus' | 'energy' | 'general';

// Default stress level per goal — feeds the ML first-request
export const GOAL_STRESS: Record<string, number> = {
  sleep:   6,
  stress:  8,
  focus:   3,
  energy:  4,
  general: 5,
};

// Default ML text hint per goal — gives ML more signal than just stress number
export const GOAL_TEXT: Record<string, string> = {
  sleep:   'feeling tired, want to fall asleep and rest',
  stress:  'feeling anxious and stressed, need to calm down',
  focus:   'need to concentrate and clear my mind',
  energy:  'want to boost energy and feel more alert',
  general: 'want to meditate and feel better',
};

export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
}

// Map time_of_day → capitalised for form selects
export const TIME_OF_DAY_FORM: Record<string, string> = {
  morning:   'Morning',
  afternoon: 'Afternoon',
  evening:   'Evening',
  night:     'Night',
};

export function saveMlDefaults(goal: string): void {
  const stress = GOAL_STRESS[goal] ?? 5;
  localStorage.setItem('breathe_goal',       goal);
  localStorage.setItem('breathe_ml_stress',  String(stress));
  localStorage.setItem('breathe_ml_time',    getTimeOfDay());
  localStorage.setItem('breathe_ml_text',    GOAL_TEXT[goal] ?? '');
}

export function getMlDefaults(): {
  stressLevel: number;
  timeOfDay:   string;  // capitalised, matches form select
  text:        string;
  goal:        string;
} {
  const goal   = localStorage.getItem('breathe_goal') ?? '';
  const stress = Number(localStorage.getItem('breathe_ml_stress') ?? GOAL_STRESS[goal] ?? 5);
  const time   = localStorage.getItem('breathe_ml_time') ?? getTimeOfDay();
  const text   = localStorage.getItem('breathe_ml_text') ?? GOAL_TEXT[goal] ?? '';

  return {
    stressLevel: stress,
    timeOfDay:   TIME_OF_DAY_FORM[time] ?? 'Evening',
    text,
    goal,
  };
}

// Call after login to sync server-side goal into local ML defaults
export function syncGoalFromProfile(profile: { bodyProfile?: { goal?: string } }): void {
  const goal = profile?.bodyProfile?.goal;
  if (goal) saveMlDefaults(goal);
}
