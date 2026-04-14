# Spec: Emoji → Lucide Icon Replacement

**Date:** 2026-04-13  
**Status:** Approved

---

## Goal

Replace emoji characters used in JSX and data objects with Lucide React icon components for visual consistency across the Breathe frontend.

---

## Scope

~30 source files in `src/` (pages, components, utils).

**In scope:**
- Emoji rendered in JSX (`<span>🏆</span>`, `{🌊 Begin Session}`, etc.)
- Emoji in data object `icon` fields rendered into JSX (`{ icon: '🌊', label: '...' }`)

**Out of scope (keep as-is):**
- Flag emojis 🇬🇧 🇷🇺 🇪🇸 in `NavBar.tsx` language switcher
- Emoji in plain JS strings: `toast.success(...)`, push notification templates in `pushNotifications.ts`

---

## Approach: Inline ReactNode (Approach A)

Change `icon: string` fields to `icon: React.ReactNode` in data objects. Each callsite gets the Lucide component inline.

```ts
// Before
{ icon: '🌊', label: 'Ocean' }
// → <span>{item.icon}</span>

// After
{ icon: <Waves size={16} />, label: 'Ocean' }
// → {item.icon}  (no change to render)
```

**Why not a central iconMap.ts:** User explicitly chose approach A for cleaner types and no extra indirection.

---

## Emoji → Lucide Mapping

| Emoji | Lucide | Emoji | Lucide |
|-------|--------|-------|--------|
| 🌊 | `Waves` | 🔥 | `Flame` |
| ⚡ | `Zap` | 🧠 | `Brain` |
| 🌙 | `Moon` | 💤 | `Bed` |
| 😴 | `Bed` | 😰 | `AlertCircle` |
| 🎯 | `Target` | 🏆 | `Trophy` |
| 📊 | `BarChart2` | 🎵 | `Music` |
| 🌿/🍃 | `Leaf` | 🌍 | `Globe` |
| 📍 | `MapPin` | ❤️/💙 | `Heart` |
| 🍎 | `Apple` | 📱 | `Smartphone` |
| 🌧 | `CloudRain` | 🔇 | `VolumeX` |
| 📳 | `Vibrate` | 🎙/🎤 | `Mic` |
| 👩/👨/👤 | `User` | 😞/😟 | `Frown` |
| 😐 | `Meh` | 🙂/😊 | `Smile` |
| 🌟/✨ | `Sparkles` | ✈️ | `Plane` |
| 💼 | `Briefcase` | 🔄/🔁 | `RefreshCw` |
| 🛡️ | `Shield` | 🏋️/💪 | `Dumbbell` |
| 🩸 | `Droplets` | 🚗 | `Car` |
| 💨 | `Wind` | 🌲 | `Trees` |
| 🏔️ | `Mountain` | ☁️ | `Cloud` |
| 🌌 | `Stars` | 📋 | `Clipboard` |
| 🌱 | `Sprout` | 👁 | `Eye` |
| 🔔 | `Bell` | 💡 | `Lightbulb` |
| 📵 | `WifiOff` | 👥 | `Users` |
| 📦 | `Package` | 🔬 | `Microscope` |
| ⚕️ | `Stethoscope` | 🤝 | `Handshake` |
| 🫀/🫁 | `Heart` | 🧘 | `PersonStanding` |
| 🌅 | `Sunrise` | 😤 | `Wind` |
| 😌 | `Smile` | 🌀 | `Loader2` |
| ⚠️ | `AlertTriangle` | 💭 | `MessageCircle` |
| 🎉 | `PartyPopper` | 🗑 | `Trash2` |
| 🔗 | `Link` | 🗺️ | `Map` |
| 🌐 | `Globe` | 🔉 | `Volume2` |
| ⛩️ | `Building` | 🧪 | `FlaskConical` |

---

## Implementation Strategy

Files are independent — run parallel subagents grouped by directory:

**Group 1 — components/** (highest priority, shared across pages)
- `AmbientSoundPlayer.tsx`, `AppleHealthImport.tsx`, `ChallengesSection.tsx`
- `GuidanceModeSelector.tsx`, `GuidancePicker.tsx`, `HeartRateMonitor.tsx`
- `HomeInteractive.tsx`, `NavBar.tsx` (skip flags), `NewsletterWidget.tsx`
- `OfflineIndicator.tsx`, `OnboardingTour.tsx`, `PWAInstallBanner.tsx`
- `SessionFeedbackModal.tsx`, `UserProgressStrip.tsx`
- `charts/AnnualProgressChart.tsx`, `charts/HRVCorrelation.tsx`
- `charts/MonthlyActivityChart.tsx`, `charts/WeeklyActivityChart.tsx`
- `Globe/GlobeControls.tsx`, `Globe/GlobePinMarker.tsx`
- `AICoach/SoulOrb.tsx`, `AICoach/AICoachModal.tsx`
- `CalmScoreResult.tsx`

**Group 2 — pages/** (main pages)
- `HomePage.tsx`, `SessionPage.tsx`, `ProfilePage.tsx`, `StatsPage.tsx`
- `LeaderboardPage.tsx`, `JournalPage.tsx`, `OnboardingPage.tsx`
- `ChallengesPage.tsx`, `CommunityPage.tsx`, `GlobePage.tsx`
- `FaqPage.tsx`, `SignUpPage.tsx`, `DataConsentPage.tsx`

**Group 3 — pages/techniques/ + pages/sleep/ + pages/science/**
- `BoxBreathingPage.tsx`, `Breathing478Page.tsx`, `WimHofPage.tsx`
- `BreathingAnxietyPage.tsx`, `MorningRitualPage.tsx`
- `WhySleepPage.tsx`, `SleepApneaPage.tsx`, `BreathworkSleepPage.tsx`
- `SleepStoryPage.tsx`, `SlowBreathingPage.tsx`

---

## Size convention

Use `size={16}` for inline text icons, `size={20}` for card/list icons, `size={24}` for section headers, `size={32}` for hero/empty-state icons. Match visual weight of replaced emoji.

---

## Constraints

- `lucide-react` v0.487.0 already installed — no new dependencies
- TypeScript strict mode — all `icon: string` changed to `icon: React.ReactNode`
- Do NOT touch `pushNotifications.ts` string templates
- Do NOT touch flag emoji in `NavBar.tsx`
