# Emoji → Lucide Icon Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all emoji characters in JSX and data objects with Lucide React icon components for visual consistency.

**Architecture:** Each file is modified independently — add Lucide imports, change `emoji/icon: string` fields to `React.ReactNode`, replace inline JSX emoji spans with icon components. No shared state, no new files needed.

**Tech Stack:** React 18, TypeScript, lucide-react v0.487.0 (already installed)

---

## Global Reference: Emoji → Lucide Mapping

```
🌊 → Waves        🔥 → Flame         ⚡ → Zap           🧠 → Brain
🌙 → Moon         💤 → Bed           😴 → Bed           😰 → AlertCircle
🎯 → Target       🏆 → Trophy        📊 → BarChart2      🎵 → Music
🌿/🍃 → Leaf      🌍 → Globe         📍 → MapPin         ❤️/💙 → Heart
🍎 → Apple        📱 → Smartphone    🌧 → CloudRain      🔇 → VolumeX
📳 → Vibrate      🎙/🎤 → Mic       👩/👨/👤 → User    😞/😟 → Frown
😐 → Meh          🙂/😊 → Smile     🌟/✨ → Sparkles    ✈️ → Plane
💼 → Briefcase    🔄/🔁 → RefreshCw  🛡️ → Shield        🏋️/💪 → Dumbbell
🩸 → Droplets     🚗 → Car           💨 → Wind           🌲 → Trees
🏔️ → Mountain    ☁️ → Cloud          🌌 → Stars          📋 → Clipboard
🌱 → Sprout       👁 → Eye           🔔 → Bell           💡 → Lightbulb
📵 → WifiOff      👥 → Users         📦 → Package        🔬 → Microscope
⚕️ → Stethoscope  🤝 → Handshake     🫀/🫁 → Heart       🧘 → PersonStanding
🌅 → Sunrise      😤 → Wind          😌 → Smile          🌀 → Loader2
⚠️ → AlertTriangle 💭 → MessageCircle 🎉 → PartyPopper   🗑 → Trash2
🗺️ → Map          🌐 → Globe         🔉 → Volume2        ⛩️ → Building2
🧪 → FlaskConical  🏅 → Medal        🥇/🥈/🥉 → Medal   📅 → Calendar
🔗 → Link2        🤖 → Bot           👥 → Users          🌫 → Cloud
```

## Size Convention

```
size={16}  — inline within text, small badges, list item icons
size={20}  — card icons, list icons
size={24}  — section headers, modal headers
size={32}  — hero/empty-state icons
size={42}  — large decorative icons
```

## Rules

1. Strings in `toast.success(...)`, `pushNotifications.ts` → **DO NOT TOUCH**
2. Flag emojis `🇬🇧 🇷🇺 🇪🇸` in `NavBar.tsx` → **DO NOT TOUCH**
3. `icon/emoji: string` in data objects → change type to `React.ReactNode`, value to `<IconName size={N} />`
4. `<span>{emoji}</span>` in JSX → replace with `<IconName size={N} />`
5. Add Lucide import at top of file, grouped with existing imports

---

## Task 1: AmbientSoundPlayer + GuidanceModeSelector + GuidancePicker + NavBar + NewsletterWidget + OfflineIndicator

**Files:**
- Modify: `src/components/AmbientSoundPlayer.tsx`
- Modify: `src/components/GuidanceModeSelector.tsx`
- Modify: `src/components/GuidancePicker.tsx`
- Modify: `src/components/NavBar.tsx`
- Modify: `src/components/NewsletterWidget.tsx`
- Modify: `src/components/OfflineIndicator.tsx`

- [ ] **Step 1: AmbientSoundPlayer.tsx**

Change SOUNDS array type and values, replace inline emoji spans:

```tsx
// Add import at top:
import { CloudRain, Waves, Leaf, Wind, Volume2, Music } from 'lucide-react';

// Change type:
const SOUNDS: { id: SoundType; label: string; icon: React.ReactNode }[] = [
  { id: 'rain',   label: 'Rain',        icon: <CloudRain size={18} /> },
  { id: 'ocean',  label: 'Ocean',       icon: <Waves size={18} /> },
  { id: 'forest', label: 'Forest',      icon: <Leaf size={18} /> },
  { id: 'white',  label: 'White noise', icon: <Wind size={18} /> },
];

// In render — change:
// <span style={{ fontSize: 18 }}>{s.emoji}</span>
// to:
{s.icon}

// Change toggle button icon:
// <span style={{ fontSize: 13 }}>🎵</span>
// to:
<Music size={13} />

// Change volume label:
// <span className="t-label" style={{ color: ts.textDim }}>🔉</span>
// to:
<Volume2 size={14} style={{ color: ts.textDim }} />
```

- [ ] **Step 2: GuidanceModeSelector.tsx**

```tsx
// Add import:
import { Vibrate, Mic, Lightbulb } from 'lucide-react';

// Replace:
// 📳 {t('breathing.guidance.vibrationHint', ...)}
// to:
<><Vibrate size={14} /> {t('breathing.guidance.vibrationHint', 'Vibration requires Android + Chrome')}</>

// Replace:
// 🎙 {t('breathing.guidance.voiceHint', ...)}
// to:
<><Mic size={14} /> {t('breathing.guidance.voiceHint', "Uses your browser's built-in speech")}</>

// Replace:
// 💡 {t('breathing.guidance.eyesClosedHint', ...)}
// to:
<><Lightbulb size={14} /> {t('breathing.guidance.eyesClosedHint', 'You can now close your eyes — the app will guide you')}</>
```

- [ ] **Step 3: GuidancePicker.tsx**

```tsx
// Add import:
import { VolumeX, Vibrate, Mic, User } from 'lucide-react';

// Change MODE_ICONS:
const MODE_ICONS: Record<GuidanceMode, React.ReactNode> = {
  silent:    <VolumeX size={16} />,
  vibration: <Vibrate size={16} />,
  voice:     <Mic size={16} />,
};

// Replace gender icons:
// {g === 'female' ? '👩' : '👨'}
// to:
<User size={20} />
```

- [ ] **Step 4: NavBar.tsx — skip flags**

No emoji changes needed (flags are kept per spec).

- [ ] **Step 5: NewsletterWidget.tsx**

```tsx
// Add import:
import { Waves } from 'lucide-react';

// Replace:
// <span className="t-body">🌊</span>
// to:
<Waves size={20} />
```

- [ ] **Step 6: OfflineIndicator.tsx**

```tsx
// Add import:
import { WifiOff } from 'lucide-react';

// Replace:
// 📵 You're offline — breathing still works
// to:
<><WifiOff size={14} /> You're offline — breathing still works</>
```

- [ ] **Step 7: TypeScript check**

```bash
cd "C:/Users/Mikhail Senatorov/Documents/Douglas/Breathe/frontend"
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -20
```

Expected: no errors in modified files.

- [ ] **Step 8: Commit**

```bash
git add src/components/AmbientSoundPlayer.tsx src/components/GuidanceModeSelector.tsx src/components/GuidancePicker.tsx src/components/NewsletterWidget.tsx src/components/OfflineIndicator.tsx
git commit -m "refactor: replace emoji with Lucide in ambient/guidance/nav components"
```

---

## Task 2: ChallengesSection + HomeInteractive + OnboardingTour + PWAInstallBanner + UserProgressStrip + AppleHealthImport

**Files:**
- Modify: `src/components/ChallengesSection.tsx`
- Modify: `src/components/HomeInteractive.tsx`
- Modify: `src/components/OnboardingTour.tsx`
- Modify: `src/components/PWAInstallBanner.tsx`
- Modify: `src/components/UserProgressStrip.tsx`
- Modify: `src/components/AppleHealthImport.tsx`

- [ ] **Step 1: ChallengesSection.tsx**

```tsx
// Add import:
import { Users, Trophy, AlertTriangle, PartyPopper } from 'lucide-react';

// Replace:
// 👥 {fmtJoins(joins)} joined
// to:
<><Users size={12} /> {fmtJoins(joins)} joined</>

// Replace:
// <span className="text-3xl">⚠️</span>
// to:
<AlertTriangle size={32} />

// Replace both instances of:
// <span className="text-4xl">🏆</span>  and  <span className="text-3xl">🏆</span>
// to:
<Trophy size={40} />   and   <Trophy size={32} />

// toast.success line — keep emoji (it's in a string)
```

- [ ] **Step 2: HomeInteractive.tsx**

```tsx
// Add import:
import { AlertCircle, Loader2, Waves, FlaskConical, BarChart2 } from 'lucide-react';

// Change RESULTS array type: emoji → icon: React.ReactNode
{ icon: <AlertCircle size={20} color="#FF8A8A" />, title: 'Stress Breather', color: '#FF8A8A', ... }
{ icon: <Loader2 size={20} color="#FFD97D" />,     title: 'Shallow Breather', color: '#FFD97D', ... }
{ icon: <Waves size={20} color="#4AE8A0" />,        title: 'Natural Breather', color: '#4AE8A0', ... }

// Replace in tab toggle:
// {t === 'quiz' ? '🧪 Breathing Quiz' : '📊 Stress Score'}
// to:
{t === 'quiz'
  ? <><FlaskConical size={14} /> Breathing Quiz</>
  : <><BarChart2 size={14} /> Stress Score</>}
```

- [ ] **Step 3: OnboardingTour.tsx**

```tsx
// Add import:
import { Waves, Users, BarChart2, Pencil } from 'lucide-react';

// Change title fields from string to ReactNode:
{ title: <><Waves size={16} /> Start breathing</>, ... }
{ title: <><Users size={16} /> Community</>, ... }
{ title: <><BarChart2 size={16} /> Your Profile</>, ... }
{ title: <><Pencil size={16} /> Log a session</>, ... }
```

- [ ] **Step 4: PWAInstallBanner.tsx**

```tsx
// Add import:
import { Smartphone } from 'lucide-react';

// Replace:
// <span className="text-2xl flex-shrink-0">📱</span>
// to:
<Smartphone size={24} className="flex-shrink-0" />
```

- [ ] **Step 5: UserProgressStrip.tsx**

```tsx
// Add import:
import { Flame, Dumbbell, Trophy } from 'lucide-react';

// Replace:
// <span style={{ fontSize: 9, lineHeight: 1 }}>🔥</span>
// to:
<Flame size={9} />

// Replace:
// <span style={{ fontSize: 20 }}>🔥</span>
// to:
<Flame size={20} />

// Replace in string template — keep as-is (it's in a string `🔥 Keep your...`)

// Replace:
// {streak === 0 ? 'Start today' : streak === 1 ? 'Day one! 💪' : streak >= 7 ? 'On fire! 🔥' : 'Keep going!'}
// to:
{streak === 0 ? 'Start today' : streak === 1 ? <>Day one! <Dumbbell size={14} /></> : streak >= 7 ? <>On fire! <Flame size={14} /></> : 'Keep going!'}

// Replace:
// 🏆 {milestone.label}
// to:
<><Trophy size={14} /> {milestone.label}</>
```

- [ ] **Step 6: AppleHealthImport.tsx**

```tsx
// Add import:
import { Apple } from 'lucide-react';

// Replace:
// 🍎
// to:
<Apple size={24} />
```

- [ ] **Step 7: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -20
```

- [ ] **Step 8: Commit**

```bash
git add src/components/ChallengesSection.tsx src/components/HomeInteractive.tsx src/components/OnboardingTour.tsx src/components/PWAInstallBanner.tsx src/components/UserProgressStrip.tsx src/components/AppleHealthImport.tsx
git commit -m "refactor: replace emoji with Lucide in challenge/home/progress components"
```

---

## Task 3: SessionFeedbackModal + CalmScoreResult + HeartRateMonitor + Chart components

**Files:**
- Modify: `src/components/SessionFeedbackModal.tsx`
- Modify: `src/components/CalmScoreResult.tsx`
- Modify: `src/components/HeartRateMonitor.tsx`
- Modify: `src/components/charts/AnnualProgressChart.tsx`
- Modify: `src/components/charts/HRVCorrelation.tsx`
- Modify: `src/components/charts/MonthlyActivityChart.tsx`
- Modify: `src/components/charts/WeeklyActivityChart.tsx`

- [ ] **Step 1: SessionFeedbackModal.tsx**

MOODS already has `emoji: string` rendered as `{m.emoji}` in a `<span>`. Change to ReactNode:

```tsx
// Add to existing import: Frown, Meh, Smile, Sparkles
// (X, Sparkles, Brain, Target, Waves, Zap, Moon, Wind, Heart, AlertCircle, Leaf, VolumeX are already imported)

// Change MOODS:
const MOODS = [
  { value: 1,  icon: <Frown size={20} />,    label: "Rough" },
  { value: 3,  icon: <Meh size={20} />,      label: "Meh" },
  { value: 5,  icon: <Smile size={20} />,    label: "Okay" },
  { value: 7,  icon: <Smile size={20} />,    label: "Good" },
  { value: 10, icon: <Sparkles size={20} />, label: "Amazing" },
];

// In MoodPicker render, change:
// <span className={...}>{m.emoji}</span>
// to:
<span className={`transition-all duration-200 ${selected ? "scale-125" : "opacity-60"}`}>{m.icon}</span>
```

- [ ] **Step 2: CalmScoreResult.tsx**

```tsx
// Add import:
import { Waves, Flame } from 'lucide-react';

// Change result strings (they contain emoji in text values):
// 'Great session 🌊'  → 'Great session'  (remove from string, icon shown separately)
// 'Excellent! 🔥'    → 'Excellent!'
// Or keep in string — these are display text strings, not JSX.
// Per spec: strings in toast/display text → keep as-is.
// No changes needed if emojis are only in string values, not rendered as JSX spans.
// If there ARE <span>🌊</span> elements, replace with <Waves size={16} />
```

Read the file to confirm before editing.

- [ ] **Step 3: HeartRateMonitor.tsx**

```tsx
// Add import:
import { AlertTriangle, Apple, Smartphone, Bot } from 'lucide-react';

// Replace:
// <span className="text-[#FF9A5C] t-caption">⚠️ No skin contact...</span>
// to:
<span className="text-[#FF9A5C] t-caption flex items-center gap-1"><AlertTriangle size={12} /> No skin contact detected — ensure device is on your wrist</span>

// Replace string array items (rendered as list text):
// '🍎 Apple Watch...'   → keep if it's text-only; replace <Apple size={14} /> if in JSX
// '📱 Most Bluetooth...' → <Smartphone size={14} />
// '🤖 Wear OS...'        → <Bot size={14} />
```

- [ ] **Step 4: AnnualProgressChart.tsx**

```tsx
// Add import:
import { Waves } from 'lucide-react';

// Replace:
// <span className="text-3xl opacity-30">🌊</span>
// to:
<Waves size={32} style={{ opacity: 0.3 }} />
```

- [ ] **Step 5: HRVCorrelation.tsx**

```tsx
// Add import:
import { Heart } from 'lucide-react';

// Replace:
// <span className="text-3xl opacity-30">🫀</span>
// to:
<Heart size={32} style={{ opacity: 0.3 }} />
```

- [ ] **Step 6: MonthlyActivityChart.tsx**

```tsx
// Add import:
import { Loader2 } from 'lucide-react';

// Replace:
// <span className="text-3xl opacity-30">🫧</span>
// to:
<Loader2 size={32} style={{ opacity: 0.3 }} />
```

- [ ] **Step 7: WeeklyActivityChart.tsx**

```tsx
// Add import:
import { BarChart2 } from 'lucide-react';

// Replace:
// <span className="text-3xl opacity-20">📊</span>
// to:
<BarChart2 size={32} style={{ opacity: 0.2 }} />
```

- [ ] **Step 8: TypeScript check + Commit**

```bash
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -20
git add src/components/SessionFeedbackModal.tsx src/components/CalmScoreResult.tsx src/components/HeartRateMonitor.tsx src/components/charts/
git commit -m "refactor: replace emoji with Lucide in feedback modal and chart components"
```

---

## Task 4: Globe components + AICoach components

**Files:**
- Modify: `src/components/Globe/GlobeControls.tsx`
- Modify: `src/components/Globe/GlobePinMarker.tsx`
- Modify: `src/components/AICoach/SoulOrb.tsx`
- Modify: `src/components/AICoach/AICoachModal.tsx`

- [ ] **Step 1: GlobeControls.tsx**

```tsx
// Add import:
import { Globe, Map, MapPin, Heart, Trash2, Link2 } from 'lucide-react';

// Replace each occurrence:
// 🌍 {stats.totalPins...}   → <><Globe size={14} /> {stats.totalPins...}</>
// 🗺️ Want to pin...         → <><Map size={14} /> Want to pin your meditation spot?</>
// 🔗 Import from Google...  → <><Link2 size={14} /> Import from Google Maps (optional)</>
// 📍 Drop pin               → <><MapPin size={14} /> Drop pin</>
// 📍 {[...].join(', ')...}  → <><MapPin size={14} /> {[selectedPin.city, ...].join(', ') || 'Unknown location'}</>
// ❤️ {selectedPin.likeCount} → <><Heart size={14} /> {selectedPin.likeCount}</>
// 🗑 Delete                 → <><Trash2 size={14} /> Delete</>
```

- [ ] **Step 2: GlobePinMarker.tsx**

```tsx
// Add import:
import { MapPin } from 'lucide-react';

// Replace:
// 📍 {location}
// to:
<><MapPin size={12} /> {location}</>
```

- [ ] **Step 3: SoulOrb.tsx**

The `✦` character in SoulOrb is a Unicode star symbol (not emoji) — check if it needs replacing. If it's rendered as text `✦`, it stays (design symbol, not emoji).

- [ ] **Step 4: AICoachModal.tsx**

The `✦ Попробовать` line uses Unicode `✦` — not an emoji, leave as-is.

- [ ] **Step 5: TypeScript check + Commit**

```bash
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -20
git add src/components/Globe/ src/components/AICoach/
git commit -m "refactor: replace emoji with Lucide in Globe and AICoach components"
```

---

## Task 5: HomePage + SessionPage + ProfilePage + LeaderboardPage + JournalPage + OnboardingPage

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/pages/SessionPage.tsx`
- Modify: `src/pages/ProfilePage.tsx`
- Modify: `src/pages/LeaderboardPage.tsx`
- Modify: `src/pages/JournalPage.tsx`
- Modify: `src/pages/OnboardingPage.tsx`

- [ ] **Step 1: HomePage.tsx**

```tsx
// Add import (check existing lucide imports first):
import { Wind, Moon, Bed, Waves, Zap } from 'lucide-react';

// Replace JSX emojis:
// 🌬 &nbsp;Begin Session  → <><Wind size={16} />&nbsp;Begin Session</>
// 🌙 Sleep guides         → <><Moon size={16} /> Sleep guides</>
// <span className="text-2xl flex-shrink-0">🌙</span>  → <Moon size={24} className="flex-shrink-0" />

// Change icon fields in sleep links array: string → ReactNode
{ icon: <Bed size={16} />,   label: 'Why Sleep is So Important', ... }
{ icon: <Wind size={16} />,  label: 'What is Sleep Apnea?', ... }   // 😮‍💨
{ icon: <Waves size={16} />, label: 'Breathwork for Deep Sleep', ... }
{ icon: <Zap size={16} />,   label: 'Why Slow Breathing Calms You', ... }
```

- [ ] **Step 2: SessionPage.tsx**

```tsx
// Add import (check existing):
import { Frown, Meh, Smile, Sparkles, Target, Waves, Zap, Bed, Loader2, Heart, AlertCircle, Leaf, Trophy } from 'lucide-react';

// getMoodEmoji function → getMoodIcon function returning ReactNode:
function getMoodIcon(v: number): React.ReactNode {
  if (v <= 2) return <Frown size={16} />;
  if (v <= 4) return <Meh size={16} />;
  if (v <= 6) return <Smile size={16} />;
  if (v <= 8) return <Smile size={16} />;
  return <Sparkles size={16} />;
}

// NLP emoji:
// emoji = nlp?.sentiment === 'positive' ? '😌' : nlp?.sentiment === 'negative' ? '😟' : '😐'
// to:
const nlpIcon = nlp?.sentiment === 'positive' ? <Smile size={16} /> : nlp?.sentiment === 'negative' ? <Frown size={16} /> : <Meh size={16} />;

// TAG_EMOTIONS object — change string values to ReactNode:
const TAG_EMOTIONS: Record<string, React.ReactNode> = {
  focused:    <Target size={16} />,
  calm:       <Waves size={16} />,
  energized:  <Zap size={16} />,
  drowsy:     <Bed size={16} />,
  distracted: <Loader2 size={16} />,
  peaceful:   <Heart size={16} />,
  anxious:    <AlertCircle size={16} />,
  refreshed:  <Leaf size={16} />,
};

// Replace:
// <span className="t-body">🏆</span>  → <Trophy size={20} />
// <span className="t-heading">🏆</span> → <Trophy size={24} />
```

- [ ] **Step 3: ProfilePage.tsx**

```tsx
// Add import (check existing):
import { Brain, Bed, Heart, Zap, Waves, Trophy } from 'lucide-react';

// getHealthInsight function — change icon strings to ReactNode:
let icon: React.ReactNode = <Brain size={20} />;
// if poor sleep: icon = <Bed size={20} />;
// if HRV low:   icon = <Heart size={20} />;
// if high score: icon = <Zap size={20} />;
// else:          icon = <Waves size={20} />;

// Replace:
// <span className="t-heading">🏆</span>  → <Trophy size={24} />
```

- [ ] **Step 4: LeaderboardPage.tsx**

```tsx
// Add import (check existing):
import { Trophy, Calendar, Flame, Medal, Cloud } from 'lucide-react';

// Change TABS array: emoji → icon: React.ReactNode
const TABS = [
  { id: 'time',   label: 'All time',   icon: <Trophy size={16} />,   sub: 'Total practice minutes' },
  { id: 'weekly', label: 'This week',  icon: <Calendar size={16} />, sub: 'Minutes practised this week' },
  { id: 'streak', label: 'Streaks',    icon: <Flame size={16} />,    sub: 'Current consecutive days' },
];

// Change medals:
const medals: Record<number, React.ReactNode> = {
  1: <Medal size={16} style={{ color: '#F59E0B' }} />,
  2: <Medal size={16} style={{ color: '#9CA3AF' }} />,
  3: <Medal size={16} style={{ color: '#B45309' }} />,
};

// Replace:
// 🏆 Leaderboard            → <><Trophy size={20} /> Leaderboard</>
// <span className="text-4xl opacity-30">🌫</span> → <Cloud size={40} style={{ opacity: 0.3 }} />
// 🔥 {entry.streak}d        → <><Flame size={12} /> {entry.streak}d</>
```

- [ ] **Step 5: JournalPage.tsx**

```tsx
// Add import:
import { Smile, Frown, Meh } from 'lucide-react';

// getSentimentEmoji → getSentimentIcon returning ReactNode:
function getSentimentIcon(s: string): React.ReactNode {
  if (s === 'positive') return <Smile size={16} />;
  if (s === 'negative') return <Frown size={16} />;
  return <Meh size={16} />;
}
```

- [ ] **Step 6: OnboardingPage.tsx**

```tsx
// Add import (check existing):
import { Bed, AlertCircle, Target, Zap, Eye, Bell, Vibrate, Mic, Lightbulb, Heart, Circle } from 'lucide-react';

// Change GOALS array: emoji → icon: React.ReactNode
{ key: 'sleep',  icon: <Bed size={20} />,          label: ..., sub: ... }
{ key: 'stress', icon: <AlertCircle size={20} />,   label: ..., sub: ... }
{ key: 'focus',  icon: <Target size={20} />,        label: ..., sub: ... }
{ key: 'energy', icon: <Zap size={20} />,           label: ..., sub: ... }

// Change MODES array: emoji → icon: React.ReactNode
{ key: 'visual',    icon: <Eye size={20} />,      ... }
{ key: 'sound',     icon: <Bell size={20} />,     ... }
{ key: 'vibration', icon: <Vibrate size={20} />,  ... }
{ key: 'voice',     icon: <Mic size={20} />,      ... }

// Replace inline JSX:
// 💡 {t('onboarding.guidanceHint')} → <><Lightbulb size={14} /> {t('onboarding.guidanceHint')}</>
// <span className="t-heading flex-shrink-0">💚</span> → <Heart size={24} className="flex-shrink-0" style={{ color: '#4AE8A0' }} />
// <span className="t-heading flex-shrink-0">🔵</span> → <Circle size={24} className="flex-shrink-0" style={{ color: '#3B82F6' }} />
```

- [ ] **Step 7: TypeScript check + Commit**

```bash
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -20
git add src/pages/HomePage.tsx src/pages/SessionPage.tsx src/pages/ProfilePage.tsx src/pages/LeaderboardPage.tsx src/pages/JournalPage.tsx src/pages/OnboardingPage.tsx
git commit -m "refactor: replace emoji with Lucide in main pages"
```

---

## Task 6: ChallengesPage + CommunityPage + GlobePage + FaqPage + SignUpPage + DataConsentPage

**Files:**
- Modify: `src/pages/ChallengesPage.tsx`
- Modify: `src/pages/CommunityPage.tsx`
- Modify: `src/pages/GlobePage.tsx`
- Modify: `src/pages/FaqPage.tsx`
- Modify: `src/pages/SignUpPage.tsx`
- Modify: `src/pages/DataConsentPage.tsx`

- [ ] **Step 1: ChallengesPage.tsx**

```tsx
// Add import (check existing):
import { Trophy } from 'lucide-react';

// Replace:
// <span className="text-4xl">🏆</span>  → <Trophy size={40} />
// toast.success line — keep emoji (string)
// ✓ and → are Unicode text chars — leave as-is
```

- [ ] **Step 2: CommunityPage.tsx**

```tsx
// Add import:
import { Waves, MessageCircle, Trophy, Lightbulb } from 'lucide-react';

// Change POST_TYPES icon map (string → ReactNode):
const POST_TYPE_ICONS: Record<string, React.ReactNode> = {
  experience:  <Waves size={16} />,
  question:    <MessageCircle size={16} />,
  achievement: <Trophy size={16} />,
  tip:         <Lightbulb size={16} />,
};

// Replace:
// <span className="text-4xl opacity-30">🌊</span> → <Waves size={40} style={{ opacity: 0.3 }} />
// Publish ✓ — keep (Unicode checkmark, not emoji)
```

- [ ] **Step 3: GlobePage.tsx**

```tsx
// Add import (check existing):
import { Globe, Map, MapPin, Heart, Handshake, PersonStanding } from 'lucide-react';

// Replace JSX emojis:
// 🌍 Global Meditation Map → <><Globe size={20} /> Global Meditation Map</>
// {style === 'neon' ? '✦' : style === 'terrain' ? '▲' : ...} — Unicode symbols, leave
// 🗺️                        → <Map size={20} />
// <div style={{ fontSize: 42, marginBottom: 12 }}>🌍</div> → <Globe size={42} style={{ marginBottom: 12 }} />
// 🧘                        → <PersonStanding size={20} />
// 📍 {[...].join(...)}      → <><MapPin size={14} /> {[pin.city, pin.country].filter(Boolean).join(', ')}</>
// ❤️ {pin.likeCount}        → <><Heart size={14} /> {pin.likeCount}</>

// Change HOW_IT_WORKS array: icon string → React.ReactNode
{ icon: <Globe size={20} />,       title: 'Spin the globe', ... }
{ icon: <MapPin size={20} />,      title: 'Drop your pin', ... }
{ icon: <Handshake size={20} />,   title: 'Connect', ... }
```

- [ ] **Step 4: FaqPage.tsx**

```tsx
// Add import:
import { Sprout, Waves, Brain, User, Globe, Search } from 'lucide-react';

// Change FAQ_CATEGORIES icon fields: string → React.ReactNode
{ icon: <Sprout size={20} />, ... }
{ icon: <Waves size={20} />,  ... }
{ icon: <Brain size={20} />,  ... }
{ icon: <User size={20} />,   ... }
{ icon: <Globe size={20} />,  ... }

// Replace:
// <p className="text-4xl mb-4 opacity-30">🔍</p> → <Search size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
```

- [ ] **Step 5: SignUpPage.tsx**

```tsx
// Add import:
import { Waves, AlertCircle, Loader2, BarChart2 } from 'lucide-react';

// toast line — keep emoji (string)
// Change ref banner JSX:
// {ref === 'stress'      && '😰 Your Stress Breather result is saved'}
// to:
{ref === 'stress'      && <><AlertCircle size={14} /> Your Stress Breather result is saved</>}
{ref === 'shallow'     && <><Loader2 size={14} /> Your Shallow Breather result is saved</>}
{ref === 'natural'     && <><Waves size={14} /> Your Natural Breather result is saved</>}
{ref === 'stress-calc' && <><BarChart2 size={14} /> Your stress score ({score}/100) is saved</>}
```

- [ ] **Step 6: DataConsentPage.tsx**

The `🌊` appears only in the `example` prop string — it's a string value, not JSX. Per spec, keep as-is.

- [ ] **Step 7: TypeScript check + Commit**

```bash
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -20
git add src/pages/ChallengesPage.tsx src/pages/CommunityPage.tsx src/pages/GlobePage.tsx src/pages/FaqPage.tsx src/pages/SignUpPage.tsx src/pages/DataConsentPage.tsx
git commit -m "refactor: replace emoji with Lucide in secondary pages"
```

---

## Task 7: Technique pages (BoxBreathing, 4-7-8, WimHof, BreathingAnxiety, MorningRitual)

**Files:**
- Modify: `src/pages/techniques/BoxBreathingPage.tsx`
- Modify: `src/pages/techniques/Breathing478Page.tsx`
- Modify: `src/pages/techniques/WimHofPage.tsx`
- Modify: `src/pages/techniques/BreathingAnxietyPage.tsx`
- Modify: `src/pages/techniques/MorningRitualPage.tsx`

- [ ] **Step 1: BoxBreathingPage.tsx**

```tsx
// Add import:
import { Wind, Target, AlertCircle, Zap, Bed } from 'lucide-react';

// Replace CTA button emoji:
// 🌬 Try Box Breathing now  → <><Wind size={16} /> Try Box Breathing now</>
// 🌬 Start Box Breathing — Free → <><Wind size={16} /> Start Box Breathing — Free</>

// Change TechCard icon props: string → React.ReactNode
<TechCard icon={<Target size={20} />}       title="Focus & concentration" ... />
<TechCard icon={<AlertCircle size={20} />}  title="Stress & anxiety" ... />
<TechCard icon={<Zap size={20} />}          title="Pre-performance" ... />
<TechCard icon={<Bed size={20} />}          title="Better sleep prep" ... />
```

- [ ] **Step 2: Breathing478Page.tsx**

```tsx
// Add import:
import { Wind, Moon, AlertCircle, MessageCircle, RefreshCw } from 'lucide-react';

// Replace CTA:
// 🌙 Try 4-7-8 now — free  → <><Moon size={16} /> Try 4-7-8 now — free</>
// 🌬 Try 4-7-8 — Free      → <><Wind size={16} /> Try 4-7-8 — Free</>
// <span className="text-3xl">🌙</span> → <Moon size={32} />

// Change use-case icon props: string → React.ReactNode
{ icon: <Moon size={20} />,          title: 'Falling asleep faster', ... }
{ icon: <AlertCircle size={20} />,   title: 'Acute anxiety', ... }
{ icon: <MessageCircle size={20} />, title: 'Racing thoughts', ... }
{ icon: <RefreshCw size={20} />,     title: 'Mid-day reset', ... }
```

- [ ] **Step 3: WimHofPage.tsx**

```tsx
// Add import:
import { Flame, Zap, Dumbbell, Brain, Shield, AlertTriangle } from 'lucide-react';

// Replace:
// <span className="t-caption">⚠️</span>  → <AlertTriangle size={14} />
// 🔥 Try Wim Hof now — free             → <><Flame size={16} /> Try Wim Hof now — free</>
// <span className="text-3xl">🔥</span>   → <Flame size={32} />
// 🔥 Start Wim Hof — Free               → <><Flame size={16} /> Start Wim Hof — Free</>

// Change use-case icons: string → React.ReactNode
{ icon: <Zap size={20} />,      title: 'Morning energy boost', ... }
{ icon: <Dumbbell size={20} />, title: 'Pre-workout activation', ... }
{ icon: <Brain size={20} />,    title: 'Mental clarity', ... }
{ icon: <Shield size={20} />,   title: 'Immune support', ... }
```

- [ ] **Step 4: BreathingAnxietyPage.tsx**

```tsx
// Add import:
import { Wind, Zap, Mic, Plane, Briefcase, Moon, RefreshCw } from 'lucide-react';

// Replace CTA:
// 🌬 Start breathing now — free → <><Wind size={16} /> Start breathing now — free</>
// 🌬 Start breathing — free     → <><Wind size={16} /> Start breathing — free</>

// Change use-case icons: string → React.ReactNode
{ icon: <Zap size={20} />,       title: 'Panic attack', ... }
{ icon: <Mic size={20} />,       title: 'Before public speaking', ... }
{ icon: <Plane size={20} />,     title: 'Flight anxiety', ... }
{ icon: <Briefcase size={20} />, title: 'Work stress spiral', ... }
{ icon: <Moon size={20} />,      title: 'Anxiety at 3am', ... }
{ icon: <RefreshCw size={20} />, title: 'Daily prevention', ... }
```

- [ ] **Step 5: MorningRitualPage.tsx**

```tsx
// Add import:
import { Target, Zap, Bed, Sunrise, AlertTriangle, Wind, PersonStanding, AlertCircle, Package, Brain, Moon } from 'lucide-react';

// Replace inline JSX:
// <p className="t-caption font-semibold" style={{ color: '#F87171' }}>😴 What usually happens</p>
//   → <p ...><Bed size={12} /> What usually happens</p>
// <p className="t-caption font-semibold" style={{ color: '#4AE8A0' }}>🌅 What breathing does instead</p>
//   → <p ...><Sunrise size={12} /> What breathing does instead</p>
// <span className="t-caption flex-shrink-0">⚠️</span>  → <AlertTriangle size={14} />
// 🌬 Let the app pace you...  → <><Wind size={16} /> Let the app pace you — so you can focus on breathing</>

// Change stat icons: string → React.ReactNode
{ icon: <Target size={20} />, value: '40%', label: '...' }
{ icon: <Zap size={20} />,    value: 'Day 1', label: '...' }

// Change technique icons: string → React.ReactNode
{ icon: <PersonStanding size={20} />, ... }  // 🧘
{ icon: <Zap size={20} />, ... }             // ⚡
{ icon: <AlertCircle size={20} />, ... }     // 😰

// Change related links icons: string → React.ReactNode
{ icon: <Package size={16} />, label: 'Box Breathing — full guide', ... }
{ icon: <Brain size={16} />,   label: 'Neuroscience of breathing', ... }
{ icon: <Moon size={16} />,    label: 'Evening wind-down routine', ... }
```

- [ ] **Step 6: TypeScript check + Commit**

```bash
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -20
git add src/pages/techniques/
git commit -m "refactor: replace emoji with Lucide in technique pages"
```

---

## Task 8: Sleep pages + Science pages

**Files:**
- Modify: `src/pages/sleep/WhySleepPage.tsx`
- Modify: `src/pages/sleep/SleepApneaPage.tsx`
- Modify: `src/pages/sleep/BreathworkSleepPage.tsx`
- Modify: `src/pages/sleep/SleepStoryPage.tsx`
- Modify: `src/pages/science/SlowBreathingPage.tsx`

- [ ] **Step 1: WhySleepPage.tsx**

```tsx
// Add import:
import { Brain, Heart, Shield, Scale, Smile, Zap, Microscope, Clock, Moon, Package, Loader2, Wind } from 'lucide-react';

// Change BENEFITS array: icon string → React.ReactNode
{ icon: <Brain size={20} />,       ... }
{ icon: <Heart size={20} />,       ... }
{ icon: <Shield size={20} />,      ... }
{ icon: <Scale size={20} />,       ... }
{ icon: <Smile size={20} />,       ... }
{ icon: <Zap size={20} />,         ... }
{ icon: <Microscope size={20} />,  ... }

// Change STATS: icon string → React.ReactNode
{ icon: <Clock size={16} />,  value: '7–9 hrs', ... }
{ icon: <Brain size={16} />,  value: '23%', ... }
{ icon: <Heart size={16} />,  value: '2×', ... }

// Replace button CTA:
// 🌙 Better breathing = better sleep → <><Moon size={16} /> Better breathing = better sleep</>

// Change related techniques: icon string → React.ReactNode
{ icon: <Moon size={16} />,    ... }
{ icon: <Package size={16} />, ... }
{ icon: <Loader2 size={16} />, ... }  // 🌀

// Replace:
// <span className="t-heading">😮‍💨</span> → <Wind size={24} />
```

- [ ] **Step 2: SleepApneaPage.tsx**

```tsx
// Add import:
import { Stethoscope, Wind, Brain, RefreshCw, Heart, Droplets, Car, Moon, Package, Bed } from 'lucide-react';

// Replace:
// <span className="flex-shrink-0">⚕️</span> → <Stethoscope size={16} className="flex-shrink-0" />

// Change SYMPTOMS icons: string → React.ReactNode
{ icon: <Wind size={20} />,       ... }  // 😮‍💨
{ icon: <Brain size={20} />,      ... }
{ icon: <RefreshCw size={20} />,  ... }

// Change RISKS icons: string → React.ReactNode
{ icon: <Heart size={20} />,     ... }
{ icon: <Droplets size={20} />,  ... }
{ icon: <Brain size={20} />,     ... }
{ icon: <Car size={20} />,       ... }

// Replace CTA:
// 🌙 Try 4-7-8 breathing for better sleep → <><Moon size={16} /> Try 4-7-8 breathing for better sleep</>

// Change related links: string → React.ReactNode
{ icon: <Moon size={16} />,    ... }
{ icon: <Package size={16} />, ... }
{ icon: <Wind size={16} />,    ... }  // 💨

// Replace:
// <span className="t-heading">💤</span> → <Bed size={24} />
```

- [ ] **Step 3: BreathworkSleepPage.tsx**

```tsx
// Add import:
import { Bed, Heart, Wind, Moon, Package, Brain } from 'lucide-react';

// Change STATS: string → React.ReactNode
{ icon: <Bed size={16} />,  value: '37%', ... }
{ icon: <Heart size={16} />, value: '10–20%', ... }

// Replace:
// <p className="t-caption font-semibold" style={{ color: '#F87171' }}>😤 Sympathetic</p>
//   → <p ...><Wind size={12} /> Sympathetic</p>
// <p className="t-caption font-semibold" style={{ color: '#4AE8A0' }}>😴 Parasympathetic</p>
//   → <p ...><Bed size={12} /> Parasympathetic</p>

// Change technique icons in JSX:
// <span className="t-heading">🌙</span> → <Moon size={24} />
// <span className="t-heading">📦</span> → <Package size={24} />
// <span className="t-heading">💨</span> → <Wind size={24} />

// Change related links: string → React.ReactNode
{ icon: <Brain size={16} />, ... }  // 🧠
{ icon: <Wind size={16} />, ... }   // 😮‍💨
```

- [ ] **Step 4: SleepStoryPage.tsx**

```tsx
// Add import:
import { Trees, Waves, Mountain, Cloud, Building2, Stars, Moon, Sparkles, RefreshCw, Clipboard } from 'lucide-react';

// Change SCENES array: icon string → React.ReactNode
{ icon: <Trees size={20} />,    label: 'Forest at dusk', ... }
{ icon: <Waves size={20} />,    label: 'Ocean shore', ... }
{ icon: <Mountain size={20} />, label: 'Mountain cabin', ... }
{ icon: <Cloud size={20} />,    label: 'Floating on clouds', ... }
{ icon: <Building2 size={20} />,label: 'Japanese garden', ... }
{ icon: <Stars size={20} />,    label: 'Starlit desert', ... }

// Replace:
// <span className="text-3xl">🌙</span> → <Moon size={32} />
// '✨ Generate Story'  → becomes JSX: <><Sparkles size={14} /> Generate Story</>
// 🔁 New story         → <><RefreshCw size={14} /> New story</>
// 📋 Copy              → <><Clipboard size={14} /> Copy</>
```

- [ ] **Step 5: SlowBreathingPage.tsx**

```tsx
// Add import:
import { Heart, Lungs, Leaf, BarChart2, Microscope, AlertCircle, Target, Bed, Zap, Moon, Package, Wind } from 'lucide-react';
// Note: lucide-react v0.487 may not have Lungs — check; use Heart as fallback

// Replace:
// ['❤️', 'Heart', '(rate drops)']    → [<Heart size={16} />, 'Heart', '(rate drops)']
// ['🫁', 'Lungs', '(stretch sensors)'] → [<Heart size={16} />, 'Lungs', '(stretch sensors)']  // fallback
// ['🍃', 'Gut', '(calm digestion)']   → [<Leaf size={16} />, 'Gut', '(calm digestion)']
// <span className="t-heading flex-shrink-0">📊</span> → <BarChart2 size={24} className="flex-shrink-0" />
// <span className="t-heading flex-shrink-0">🔬</span> → <Microscope size={24} className="flex-shrink-0" />

// Change WHO_IT_HELPS icons: string → React.ReactNode
{ icon: <AlertCircle size={20} />, ... }  // 😰
{ icon: <Target size={20} />, ... }
{ icon: <Bed size={20} />, ... }           // 💤
{ icon: <Zap size={20} />, ... }

// Change related links: string → React.ReactNode
{ icon: <Moon size={16} />,    ... }
{ icon: <Package size={16} />, ... }
{ icon: <Wind size={16} />, ... }  // 💤
```

- [ ] **Step 6: TypeScript check + Commit**

```bash
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -20
git add src/pages/sleep/ src/pages/science/
git commit -m "refactor: replace emoji with Lucide in sleep and science pages"
```

---

## Final Verification

- [ ] **Full TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -E "error TS"
```
Expected: 0 errors.

- [ ] **Search for remaining emoji in JSX** (should return 0 results in non-string contexts)

```bash
grep -r --include="*.tsx" -P "[\x{1F300}-\x{1F9FF}]|[\x{2600}-\x{26FF}]" src/ | grep -v "pushNotifications\|NavBar\|translation.json"
```

- [ ] **Final commit if any stragglers found and fixed**

```bash
git add -p
git commit -m "refactor: clean up remaining emoji in JSX"
```
