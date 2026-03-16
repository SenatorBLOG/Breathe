# 🌊 Breathe — Guided Breathing & Meditation App

> A full-stack web app for guided breathing, sleep, focus and calm — with an AI coach, community forum, and session tracking. No download required.

**Live:** [breatheonline.app](https://breatheonline.app)

---

## ✨ Features

- **Animated breathing orb** — follows your breath in real time (inhale → expand, exhale → contract)
- **6 science-backed techniques** — Box Breathing, 4-7-8, Wim Hof, Coherent, Belly, Alternate Nostril
- **AI Breathing Coach** — powered by Gemini 2.5 Flash, recommends the right technique based on how you feel
- **Session tracking** — mood before/after, focus, calmness, distraction count
- **Progress dashboard** — streaks, charts, mood trends, HRV insights
- **Sleep sounds library** — ambient audio via Jamendo API
- **Community forum** — posts, comments, likes for meditators
- **Weekly Calm newsletter** — automated Sunday tip via Resend
- **Google OAuth** — sign in with Google
- **PWA** — installable on mobile, works offline

---

## 🛠 Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router v6 | Client-side routing |
| Recharts | Data visualisation |
| Sonner | Toast notifications |
| Lucide React | Icons |
| @react-oauth/google | Google OAuth |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | API server |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Google Gemini 2.5 Flash | AI Coach |
| Resend | Email / newsletter |
| bcrypt | Password hashing |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting |
| Railway | Backend + env vars |
| MongoDB Atlas | Database hosting |
| Google AI Studio | Gemini API key |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google AI Studio API key
- Google OAuth client ID

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/breathe.git
cd breathe
```

### 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Fill in `.env.local`:
```env
VITE_API_BASE=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

```bash
npm run dev
```

### 3. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_random_secret_here
GEMINI_API_KEY=your_gemini_key
RESEND_API_KEY=re_your_resend_key
CRON_SECRET=your_cron_secret
PORT=5000
```

```bash
npm run dev
```

App runs at `http://localhost:3000`

---

## 📁 Project Structure

```
breathe/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AICoach/
│   │   │   │   ├── AICoachModal.tsx     # Chat UI with typewriter effect
│   │   │   │   ├── AICoachButton.tsx    # Floating trigger button
│   │   │   │   └── SoulOrb.tsx          # Animated mascot orb with eyes
│   │   │   ├── AudioPlayer/
│   │   │   │   ├── MusicLibrary.tsx
│   │   │   │   └── GlobalAudioPlayer.tsx
│   │   │   ├── charts/
│   │   │   │   ├── StatsCards.tsx
│   │   │   │   ├── ActivityChart.tsx
│   │   │   │   ├── AnnualProgressChart.tsx
│   │   │   │   ├── MonthlyActivityChart.tsx
│   │   │   │   └── MoodTrackingGrid.tsx
│   │   │   ├── BreathingCircle.tsx      # Core breathing orb component
│   │   │   ├── VideoBackground.tsx      # Dynamic video background
│   │   │   ├── NavBar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── NewsletterWidget.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── BreathingPage.tsx        # Main meditation page
│   │   │   ├── SessionsPage.tsx
│   │   │   ├── StatsPage.tsx
│   │   │   ├── CommunityPage.tsx
│   │   │   ├── FAQPage.tsx
│   │   │   ├── SupportPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignUpPage.tsx
│   │   │   └── techniques/
│   │   │       ├── BoxBreathingPage.tsx
│   │   │       ├── Breathing478Page.tsx
│   │   │       ├── WimHofPage.tsx
│   │   │       └── BreathingAnxietyPage.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   └── MusicContext.tsx
│   │   ├── api.ts                       # Axios instance + interceptors
│   │   └── App.tsx
│   ├── public/
│   │   ├── sitemap.xml
│   │   ├── robots.txt
│   │   └── site.webmanifest
│   └── index.html                       # SEO meta tags + GA4
│
└── backend/
    ├── models/
    │   ├── User.js
    │   ├── Session.js
    │   ├── Post.js
    │   ├── Comment.js
    │   ├── SupportTicket.js
    │   └── NewsletterSubscriber.js
    ├── routes/
    │   ├── auth.js                      # Register, login, Google OAuth
    │   ├── sessions.js                  # CRUD meditation sessions
    │   ├── posts.js                     # Community posts + comments
    │   ├── coach.js                     # Gemini AI coach endpoint
    │   ├── newsletter.js                # Subscribe + weekly send
    │   └── support.js                   # Support tickets
    ├── middleware/
    │   ├── auth.js                      # JWT verification
    │   ├── optionalAuth.js              # Auth if token present, skip if not
    │   └── coachRateLimit.js            # 3/day anon, 10/day users
    └── server.js
```

---

## 🔑 Environment Variables

### Frontend (`.env.local`)
```env
VITE_API_BASE=https://your-railway-domain.up.railway.app/api
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Backend (`.env` / Railway)
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=minimum_32_char_random_string
GEMINI_API_KEY=AIza...
RESEND_API_KEY=re_...
CRON_SECRET=random_string_for_newsletter_cron
PORT=5000
NODE_ENV=production
```

---

## 🌐 API Endpoints

### Auth
```
POST /api/auth/register     Create account
POST /api/auth/login        Sign in
POST /api/auth/google       Google OAuth
```

### Sessions
```
GET    /api/sessions        Get user sessions
POST   /api/sessions        Save session
DELETE /api/sessions/:id    Delete one session
DELETE /api/sessions        Delete all sessions
```

### AI Coach
```
POST /api/coach/message     Send message, get technique recommendation
GET  /api/coach/status      Check remaining daily messages
```

### Community
```
GET    /api/posts                              Public feed
POST   /api/posts                              Create post (auth)
POST   /api/posts/:id/like                     Toggle like (auth)
GET    /api/posts/:id/comments                 Get comments
POST   /api/posts/:id/comments                 Add comment (auth)
POST   /api/posts/:id/comments/:cid/like       Like comment (auth)
```

### Newsletter
```
POST /api/newsletter/subscribe                 Subscribe email
GET  /api/newsletter/unsubscribe?token=xxx     One-click unsub
POST /api/newsletter/send-weekly               Trigger send (cron only)
```

---

## 📊 Architecture

```
User Browser
     │
     ▼
Vercel (React SPA)
     │  HTTPS API calls
     ▼
Railway (Express API)
     │
     ├── MongoDB Atlas  (sessions, users, posts)
     ├── Gemini API     (AI coach responses)
     └── Resend API     (email delivery)
```

---

## 🤖 AI Coach

The AI coach uses **Gemini 2.5 Flash** with a custom system prompt tuned for breathing/wellness coaching. It:

1. Analyzes user's current state (stress, sleep, anxiety, energy)
2. Recommends one of 6 breathing techniques
3. Explains the science in plain language
4. Provides exact timing instructions
5. Auto-detects the technique in the response and shows a "Try X" button that navigates to `/breathing` with the preset pre-loaded

Rate limits: **3 messages/day** for anonymous users, **10/day** for registered users.

---

## 📈 SEO Pages

Dedicated landing pages targeting high-volume search queries:

| URL | Target keyword | Monthly searches |
|-----|---------------|-----------------|
| `/breathing/box-breathing` | box breathing technique | 40K |
| `/breathing/4-7-8` | 4-7-8 breathing sleep | 60K |
| `/breathing/wim-hof` | wim hof breathing guide | 30K |
| `/breathing/anxiety` | breathing exercises anxiety | 90K |

---

## 📄 License

MIT — free to use, modify and distribute.

---

## 🙏 Credits

Built by [@SenatorBLOG](https://github.com/SenatorBLOG)

Inspired by the science of breathwork and the need for a calm, beautiful, no-BS meditation tool.

---

<p align="center">
  <a href="https://breatheonline.app">🌊 breatheonline.app</a>
</p>
