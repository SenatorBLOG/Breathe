# Community Page Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform CommunityPage into a hub with Hero stats, rich Sidebar, and per-post SEO routes (`/community/post/:id`).

**Architecture:** Four stages — (1) SEO post route, (2) Hero section, (3) Sidebar with dynamic data, (4) two-column layout wiring. Each stage is independently deployable. Backend gets three new endpoints in a new `community.js` router. Frontend gets two new components and one new page.

**Tech Stack:** React + TypeScript + Vite, React Router v6, framer-motion, react-helmet-async (PageSEO), Node/Express + Mongoose, Tailwind + inline styles via `useThemeStyles`.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `api/routes/community.js` | `/stats` and `/sidebar` endpoints |
| Modify | `api/routes/posts.js` | Add `GET /:id` (single post) and `GET /:id/related` |
| Modify | `api/server.js` | Register community router |
| Create | `frontend/src/pages/CommunityPostPage.tsx` | SEO page for individual post |
| Create | `frontend/src/components/community/CommunityHero.tsx` | Hero with live stats + CTA |
| Create | `frontend/src/components/community/CommunitySidebar.tsx` | Top tags, users, topics, AI coach |
| Modify | `frontend/src/pages/CommunityPage.tsx` | Two-column layout, URL-on-click, mobile chips |
| Modify | `frontend/src/App.tsx` | Add `/community/post/:id` route |

---

## Stage 1 — SEO Post Route

### Task 1: Backend — GET /api/posts/:id (single post)

**Files:**
- Modify: `api/routes/posts.js`

- [ ] **Step 1: Add `GET /:id` route** in `api/routes/posts.js` — insert **before** the `DELETE /:id` route (line ~111) so Express doesn't confuse `/:id` with `/:id/comments`:

```js
// ─── GET /api/posts/:id — single post, public ─────────────────────────────
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username name email');
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const commentCount = await Comment.countDocuments({ post: post._id });
    const userId = uid(req);
    res.json({ ...formatPost(post, userId), commentCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});
```

- [ ] **Step 2: Test manually** — start the API (`node api/server.js` or your dev command), then:
```
curl http://localhost:PORT/api/posts/SOME_VALID_POST_ID
```
Expected: JSON with `_id`, `text`, `author`, `likeCount`, `commentCount`, `tags`, `category`.

- [ ] **Step 3: Commit**
```bash
git add api/routes/posts.js
git commit -m "feat(api): add GET /api/posts/:id single post endpoint"
```

---

### Task 2: Backend — GET /api/posts/:id/related

**Files:**
- Modify: `api/routes/posts.js`

- [ ] **Step 1: Add `GET /:id/related` route** — insert after the `GET /:id` route you just added:

```js
// ─── GET /api/posts/:id/related — up to 3 posts sharing tags ─────────────
router.get('/:id/related', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('tags category');
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const filter = {
      _id: { $ne: post._id },
      $or: [
        { tags: { $in: post.tags } },
        { category: post.category },
      ],
    };

    const related = await Post.find(filter)
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('author', 'username name email');

    const userId = uid(req);
    res.json(related.map(p => formatPost(p, userId)));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch related posts' });
  }
});
```

- [ ] **Step 2: Test manually**:
```
curl http://localhost:PORT/api/posts/SOME_VALID_POST_ID/related
```
Expected: Array of 0–3 post objects.

- [ ] **Step 3: Commit**
```bash
git add api/routes/posts.js
git commit -m "feat(api): add GET /api/posts/:id/related endpoint"
```

---

### Task 3: Frontend — CommunityPostPage.tsx

**Files:**
- Create: `frontend/src/pages/CommunityPostPage.tsx`

- [ ] **Step 1: Create the page file**

```tsx
// src/pages/CommunityPostPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import PageSEO from '../components/PageSEO';
import Footer from '../components/Footer';
import api from '../api';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const TAG_PALETTE = [
  { color: '#00D4FF', bg: 'rgba(0,212,255,0.14)',   border: 'rgba(0,212,255,0.45)'   },
  { color: '#FF6B9D', bg: 'rgba(255,107,157,0.14)', border: 'rgba(255,107,157,0.45)' },
  { color: '#FFD97D', bg: 'rgba(255,217,125,0.14)', border: 'rgba(255,217,125,0.45)' },
  { color: '#A78BFA', bg: 'rgba(167,139,250,0.14)', border: 'rgba(167,139,250,0.45)' },
  { color: '#FF9A5C', bg: 'rgba(255,154,92,0.14)',  border: 'rgba(255,154,92,0.45)'  },
  { color: '#34D399', bg: 'rgba(52,211,153,0.14)',  border: 'rgba(52,211,153,0.45)'  },
  { color: '#F87171', bg: 'rgba(248,113,113,0.14)', border: 'rgba(248,113,113,0.45)' },
] as const;

function pickTagColor(tag: string) {
  const idx = [...tag].reduce((n, c) => n + c.charCodeAt(0), 0) % TAG_PALETTE.length;
  return TAG_PALETTE[idx];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
  experience:  { label: 'Experience',  color: '#4A9EFF', bg: 'rgba(74,158,255,0.12)'  },
  question:    { label: 'Question',    color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  achievement: { label: 'Achievement', color: '#FF9A5C', bg: 'rgba(255,154,92,0.12)'  },
  tip:         { label: 'Tip',         color: '#FFD97D', bg: 'rgba(255,217,125,0.12)' },
};

interface Author { _id: string; username?: string; name?: string; }
interface Post {
  _id: string;
  author: Author;
  text: string;
  category: string;
  tags: string[];
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  createdAt: string;
}

function RelatedCard({ post }: { post: Post }) {
  const ts = useThemeStyles();
  return (
    <Link to={`/community/post/${post._id}`}
      className="block p-4 rounded-2xl border transition-all hover:opacity-80"
      style={{ background: ts.cardBg, borderColor: ts.border }}>
      <p className="t-caption font-medium mb-1 line-clamp-2" style={{ color: ts.textSecondary }}>
        {post.text.slice(0, 120)}{post.text.length > 120 ? '…' : ''}
      </p>
      <div className="flex items-center gap-3 mt-2">
        <span className="t-label" style={{ color: ts.textDim }}>
          {post.author.name || post.author.username}
        </span>
        <span className="t-label flex items-center gap-1" style={{ color: ts.textDim }}>
          <Heart size={10} /> {post.likeCount}
        </span>
      </div>
    </Link>
  );
}

export default function CommunityPostPage() {
  const { id } = useParams<{ id: string }>();
  const ts = useThemeStyles();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    Promise.all([
      api.get(`/posts/${id}`),
      api.get(`/posts/${id}/related`),
    ])
      .then(([postRes, relRes]) => {
        setPost(postRes.data);
        setRelated(relRes.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const cat = post ? (CATEGORY_META[post.category] ?? CATEGORY_META.experience) : null;

  const seoTitle = post
    ? `${post.text.slice(0, 60)}${post.text.length > 60 ? '…' : ''}`
    : 'Community Post';
  const seoDesc = post
    ? post.text.slice(0, 160)
    : 'Read this breathwork community post on Breathe.';

  return (
    <div className="relative min-h-screen font-montserrat overflow-x-hidden">
      <PageSEO
        title={seoTitle}
        description={seoDesc}
        canonical={`/community/post/${id}`}
      />
      <ThemeBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6">

          {/* Back */}
          <button onClick={() => navigate('/community')}
            className="flex items-center gap-2 t-caption transition-colors self-start"
            style={{ color: ts.textMuted }}>
            <ArrowLeft size={14} /> Back to community
          </button>

          {loading && (
            <div className="flex flex-col gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-6 rounded-xl animate-pulse" style={{ background: ts.cardBg, opacity: 1 - i * 0.2 }} />
              ))}
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <span className="text-4xl opacity-30">🌊</span>
              <p className="t-body" style={{ color: ts.textMuted }}>Post not found or has been deleted.</p>
              <Link to="/community" className="t-caption" style={{ color: ts.accent }}>← Back to community</Link>
            </div>
          )}

          {post && cat && (
            <motion.article
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 p-6 rounded-2xl border"
              style={{ background: ts.cardBg, borderColor: ts.border }}>

              {/* Category + tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="t-label px-2 py-0.5 rounded-full"
                  style={{ color: cat.color, background: cat.bg }}>
                  {cat.label}
                </span>
                {post.tags.map(tag => {
                  const tc = pickTagColor(tag);
                  return (
                    <span key={tag} className="t-label px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: tc.bg, border: `1px solid ${tc.border}`, color: tc.color }}>
                      #{tag}
                    </span>
                  );
                })}
              </div>

              {/* Author + time */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center t-label font-bold flex-shrink-0"
                  style={{ background: ts.btnGradient, color: '#fff' }}>
                  {(post.author.name || post.author.username || '?').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="t-caption font-medium leading-none" style={{ color: ts.textSecondary }}>
                    {post.author.name || post.author.username}
                  </p>
                  <p className="t-caption mt-0.5" style={{ color: ts.textDim }}>{timeAgo(post.createdAt)}</p>
                </div>
              </div>

              {/* Post text */}
              <p className="t-body leading-relaxed" style={{ color: ts.textSecondary }}>
                {post.text}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: ts.border }}>
                <span className="flex items-center gap-1.5 t-caption" style={{ color: ts.textMuted }}>
                  <Heart size={13} /> {post.likeCount}
                </span>
                <span className="flex items-center gap-1.5 t-caption" style={{ color: ts.textMuted }}>
                  <MessageCircle size={13} /> {post.commentCount} comments
                </span>
              </div>
            </motion.article>
          )}

          {/* Related posts */}
          {related.length > 0 && (
            <section className="flex flex-col gap-3">
              <p className="t-label uppercase tracking-widest font-semibold" style={{ color: ts.textSecondary }}>
                Related posts
              </p>
              {related.map(r => <RelatedCard key={r._id} post={r} />)}
            </section>
          )}

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 py-6 text-center border-t" style={{ borderColor: `${ts.border}50` }}>
            <p className="t-caption" style={{ color: ts.textMuted }}>
              Join the conversation
            </p>
            <Link to="/community"
              className="px-8 py-3 rounded-xl t-body font-medium text-white transition-all hover:opacity-90"
              style={{ background: ts.btnGradient }}>
              Go to Community
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add frontend/src/pages/CommunityPostPage.tsx
git commit -m "feat(frontend): add CommunityPostPage with SEO meta tags"
```

---

### Task 4: Register route in App.tsx

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Add lazy import** — after the `CommunityPage` import (line 20):

```tsx
const CommunityPostPage    = lazy(() => import('./pages/CommunityPostPage'));
```

- [ ] **Step 2: Add route** — after the `/community` route (line 88):

```tsx
<Route path="/community/post/:id" element={<PageWrapper><CommunityPostPage /></PageWrapper>} />
```

- [ ] **Step 3: Test** — navigate to `/community`, note a post `_id` from the network tab, visit `/community/post/<id>` in the browser. Page should load with correct title and description in `<head>`.

- [ ] **Step 4: Commit**
```bash
git add frontend/src/App.tsx
git commit -m "feat(router): add /community/post/:id SEO route"
```

---

### Task 5: URL-on-click in CommunityPage

**Files:**
- Modify: `frontend/src/pages/CommunityPage.tsx`

- [ ] **Step 1: Import `useNavigate`** — add to the existing `react-router-dom` import at the top of `CommunityPage.tsx`:

```tsx
import { Link, useNavigate } from 'react-router-dom';
```

- [ ] **Step 2: Add `navigate` hook** — inside `export default function CommunityPage()` after the existing state declarations (around line 729):

```tsx
const navigate = useNavigate();
```

- [ ] **Step 3: Add click handler to PostCard wrapper** — in the `PostCard` component's outer `<div>` (line ~450), add an `onClick` that updates the URL without navigation. Wrap the existing `<div className="flex flex-col gap-3 p-4 ...">` in a `<div>` with `onClick`:

Find this in `PostCard`'s return:
```tsx
      <div className="flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-300"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
```

Change to:
```tsx
      <div
        className="flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-300 cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          // Don't navigate when clicking interactive elements
          const target = e.target as HTMLElement;
          if (target.closest('button, a, input, textarea')) return;
          window.history.pushState(null, '', `/community/post/${post._id}`);
        }}
```

- [ ] **Step 4: Verify** — in the browser, click on the card body (not a button). The URL should change to `/community/post/<id>`. Pressing back should return to `/community`.

- [ ] **Step 5: Commit**
```bash
git add frontend/src/pages/CommunityPage.tsx
git commit -m "feat(community): update URL on post click for SEO sharing"
```

---

## Stage 2 — Hero Section

### Task 6: Backend — GET /api/community/stats

**Files:**
- Create: `api/routes/community.js`
- Modify: `api/server.js`

- [ ] **Step 1: Create `api/routes/community.js`**:

```js
// routes/community.js
const express = require('express');
const router  = express.Router();
const Post    = require('../models/Post');
const User    = require('../models/User');

// Simple in-memory cache: { data, expiresAt }
let statsCache = null;

// ─── GET /api/community/stats ─────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const now = Date.now();
    if (statsCache && statsCache.expiresAt > now) {
      return res.json(statsCache.data);
    }

    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [members, posts, activeThisWeek] = await Promise.all([
      User.countDocuments({}),
      Post.countDocuments({}),
      Post.distinct('author', { createdAt: { $gte: oneWeekAgo } }).then(ids => ids.length),
    ]);

    const data = { members, posts, activeThisWeek };
    statsCache = { data, expiresAt: now + 60 * 60 * 1000 }; // 1 hour TTL
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
```

- [ ] **Step 2: Register router in `api/server.js`** — add after the existing route registrations (find the block around line 102):

```js
const communityRouter = require('./routes/community');
// ...
app.use('/api/community', communityRouter);
```

- [ ] **Step 3: Test**:
```
curl http://localhost:PORT/api/community/stats
```
Expected: `{ "members": N, "posts": N, "activeThisWeek": N }`

- [ ] **Step 4: Commit**
```bash
git add api/routes/community.js api/server.js
git commit -m "feat(api): add GET /api/community/stats with 1h cache"
```

---

### Task 7: Frontend — CommunityHero.tsx

**Files:**
- Create: `frontend/src/components/community/CommunityHero.tsx`

- [ ] **Step 1: Create directory and file**:

```tsx
// src/components/community/CommunityHero.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Flame, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api';
import { useThemeStyles } from '../../hooks/useThemeStyles';

interface Stats { members: number; posts: number; activeThisWeek: number; }

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  const ts = useThemeStyles();
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: ts.accent }}>{icon}</span>
      <span className="t-body font-semibold tabular-nums" style={{ color: ts.textSecondary }}>
        {value.toLocaleString()}
      </span>
      <span className="t-caption" style={{ color: ts.textMuted }}>{label}</span>
    </div>
  );
}

export default function CommunityHero({ isLoggedIn, onPost }: {
  isLoggedIn: boolean;
  onPost: () => void;
}) {
  const ts = useThemeStyles();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/community/stats')
      .then(r => setStats(r.data))
      .catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl p-5 border flex flex-col gap-4"
      style={{ background: ts.cardBg, borderColor: ts.border }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-3">
          {stats ? (
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <StatPill icon={<Users size={14} />} value={stats.members} label="practitioners" />
              <StatPill icon={<BookOpen size={14} />} value={stats.posts} label="stories" />
              <StatPill icon={<Flame size={14} />} value={stats.activeThisWeek} label="active this week" />
            </div>
          ) : (
            <div className="flex gap-4">
              {[80, 100, 90].map((w, i) => (
                <div key={i} className="h-4 rounded-full animate-pulse" style={{ width: w, background: ts.border }} />
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {isLoggedIn ? (
            <button
              onClick={onPost}
              className="px-5 py-2.5 rounded-full t-body text-white font-medium tracking-wide transition-all hover:opacity-90 hover:scale-105 active:scale-95"
              style={{ background: ts.btnGradient }}>
              Share your experience
            </button>
          ) : (
            <div className="flex gap-2">
              <Link to="/signup"
                className="px-5 py-2.5 rounded-full t-body text-white font-medium transition-all hover:opacity-90"
                style={{ background: ts.btnGradient }}>
                Create account
              </Link>
              <Link to="/login"
                className="px-5 py-2.5 rounded-full t-body transition-all border"
                style={{ color: ts.textSecondary, borderColor: ts.border }}>
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add frontend/src/components/community/CommunityHero.tsx
git commit -m "feat(community): add CommunityHero with live stats + CTA"
```

---

## Stage 3 — Sidebar

### Task 8: Backend — GET /api/community/sidebar

**Files:**
- Modify: `api/routes/community.js`

- [ ] **Step 1: Add sidebar cache variable and route** — add after the `/stats` route in `api/routes/community.js`:

```js
let sidebarCache = null;

// ─── GET /api/community/sidebar ───────────────────────────────────────────
router.get('/sidebar', async (req, res) => {
  try {
    const now = Date.now();
    if (sidebarCache && sidebarCache.expiresAt > now) {
      return res.json(sidebarCache.data);
    }

    const oneWeekAgo  = new Date(now - 7  * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Top tags by frequency in last 30 days
    const tagAgg = await Post.aggregate([
      { $match: { createdAt: { $gte: oneMonthAgo }, tags: { $exists: true, $ne: [] } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const topTags = tagAgg.map(t => t._id);

    // Top users by post count in last 7 days
    const userAgg = await Post.aggregate([
      { $match: { createdAt: { $gte: oneWeekAgo } } },
      { $group: { _id: '$author', postCount: { $sum: 1 } } },
      { $sort: { postCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 1, postCount: 1, name: '$user.name', username: '$user.username' } },
    ]);
    const topUsers = userAgg.map(u => ({
      _id: u._id,
      name: u.name || u.username || 'User',
      postCount: u.postCount,
    }));

    // Popular posts: top 3 by likes in last 7 days
    const popularPosts = await Post.find({ createdAt: { $gte: oneWeekAgo } })
      .sort({ 'likes.length': -1 })
      .limit(3)
      .select('_id text tags likes');

    // Sort by actual likes array length
    const sortedPopular = popularPosts
      .map(p => ({ _id: p._id, text: p.text, tags: p.tags, likeCount: p.likes.length }))
      .sort((a, b) => b.likeCount - a.likeCount);

    const data = { topTags, topUsers, popularPosts: sortedPopular };
    sidebarCache = { data, expiresAt: now + 30 * 60 * 1000 }; // 30 min TTL
    res.json(data);
  } catch (err) {
    console.error('GET /community/sidebar error:', err.message);
    res.status(500).json({ error: 'Failed to fetch sidebar data' });
  }
});
```

- [ ] **Step 2: Test**:
```
curl http://localhost:PORT/api/community/sidebar
```
Expected: `{ "topTags": [...], "topUsers": [...], "popularPosts": [...] }`

- [ ] **Step 3: Commit**
```bash
git add api/routes/community.js
git commit -m "feat(api): add GET /api/community/sidebar with 30min cache"
```

---

### Task 9: Frontend — CommunitySidebar.tsx

**Files:**
- Create: `frontend/src/components/community/CommunitySidebar.tsx`

- [ ] **Step 1: Create the file**:

```tsx
// src/components/community/CommunitySidebar.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Tag, Users, Bot } from 'lucide-react';
import api from '../../api';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const TAG_PALETTE = [
  { color: '#00D4FF', bg: 'rgba(0,212,255,0.14)',   border: 'rgba(0,212,255,0.45)'   },
  { color: '#FF6B9D', bg: 'rgba(255,107,157,0.14)', border: 'rgba(255,107,157,0.45)' },
  { color: '#FFD97D', bg: 'rgba(255,217,125,0.14)', border: 'rgba(255,217,125,0.45)' },
  { color: '#A78BFA', bg: 'rgba(167,139,250,0.14)', border: 'rgba(167,139,250,0.45)' },
  { color: '#FF9A5C', bg: 'rgba(255,154,92,0.14)',  border: 'rgba(255,154,92,0.45)'  },
  { color: '#34D399', bg: 'rgba(52,211,153,0.14)',  border: 'rgba(52,211,153,0.45)'  },
  { color: '#F87171', bg: 'rgba(248,113,113,0.14)', border: 'rgba(248,113,113,0.45)' },
] as const;

function pickTagColor(tag: string) {
  const idx = [...tag].reduce((n, c) => n + c.charCodeAt(0), 0) % TAG_PALETTE.length;
  return TAG_PALETTE[idx];
}

interface SidebarData {
  topTags: string[];
  topUsers: { _id: string; name: string; postCount: number }[];
  popularPosts: { _id: string; text: string; tags: string[]; likeCount: number }[];
}

function SidebarBlock({ title, icon, children }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const ts = useThemeStyles();
  return (
    <div className="rounded-2xl p-4 border flex flex-col gap-3"
      style={{ background: ts.cardBg, borderColor: ts.border }}>
      <div className="flex items-center gap-2">
        <span style={{ color: ts.accent }}>{icon}</span>
        <p className="t-label uppercase tracking-widest font-semibold" style={{ color: ts.textSecondary }}>
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

function SkeletonLine({ width = '100%' }: { width?: string | number }) {
  const ts = useThemeStyles();
  return <div className="h-3 rounded-full animate-pulse" style={{ width, background: ts.border }} />;
}

export default function CommunitySidebar({ onTagClick }: {
  onTagClick: (tag: string) => void;
}) {
  const ts = useThemeStyles();
  const [data, setData] = useState<SidebarData | null>(null);

  useEffect(() => {
    api.get('/community/sidebar')
      .then(r => setData(r.data))
      .catch(() => {});
  }, []);

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0">

      {/* Popular topics */}
      <SidebarBlock title="Hot topics" icon={<Flame size={13} />}>
        {data ? (
          data.popularPosts.length === 0 ? (
            <p className="t-caption" style={{ color: ts.textDim }}>No posts yet this week</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.popularPosts.map(p => (
                <Link key={p._id} to={`/community/post/${p._id}`}
                  className="block t-caption leading-snug transition-opacity hover:opacity-70"
                  style={{ color: ts.textMuted }}>
                  {p.text.slice(0, 70)}{p.text.length > 70 ? '…' : ''}
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col gap-2">
            <SkeletonLine width="90%" />
            <SkeletonLine width="75%" />
            <SkeletonLine width="80%" />
          </div>
        )}
      </SidebarBlock>

      {/* Top tags */}
      <SidebarBlock title="Top tags" icon={<Tag size={13} />}>
        {data ? (
          data.topTags.length === 0 ? (
            <p className="t-caption" style={{ color: ts.textDim }}>No tags yet</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {data.topTags.map(tag => {
                const tc = pickTagColor(tag);
                return (
                  <button key={tag}
                    onClick={() => onTagClick(tag)}
                    className="t-label px-2 py-0.5 rounded-full transition-opacity hover:opacity-70"
                    style={{ backgroundColor: tc.bg, border: `1px solid ${tc.border}`, color: tc.color }}>
                    #{tag}
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {[50, 65, 45, 70, 55].map((w, i) => (
              <div key={i} className="h-5 rounded-full animate-pulse" style={{ width: w, background: ts.border }} />
            ))}
          </div>
        )}
      </SidebarBlock>

      {/* Active users */}
      <SidebarBlock title="Active this week" icon={<Users size={13} />}>
        {data ? (
          data.topUsers.length === 0 ? (
            <p className="t-caption" style={{ color: ts.textDim }}>No activity yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.topUsers.map(u => (
                <div key={String(u._id)} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center t-label font-bold"
                      style={{ background: ts.btnGradient, color: '#fff', fontSize: 9 }}>
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="t-caption truncate" style={{ color: ts.textSecondary }}>{u.name}</span>
                  </div>
                  <span className="t-label flex-shrink-0" style={{ color: ts.textDim }}>
                    {u.postCount} post{u.postCount !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col gap-2">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full animate-pulse flex-shrink-0" style={{ background: ts.border }} />
                <SkeletonLine width="60%" />
              </div>
            ))}
          </div>
        )}
      </SidebarBlock>

      {/* AI Coach CTA */}
      <div className="rounded-2xl p-4 border flex flex-col gap-3"
        style={{ background: `${ts.accent}08`, borderColor: `${ts.accent}25` }}>
        <div className="flex items-center gap-2">
          <Bot size={13} style={{ color: ts.accent }} />
          <p className="t-label uppercase tracking-widest font-semibold" style={{ color: ts.textSecondary }}>
            AI Coach
          </p>
        </div>
        <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
          Get personalized breathing guidance from your AI coach.
        </p>
        <Link to="/coach"
          className="t-caption font-medium transition-opacity hover:opacity-70"
          style={{ color: ts.accent }}>
          Open coach →
        </Link>
      </div>

    </aside>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add frontend/src/components/community/CommunitySidebar.tsx
git commit -m "feat(community): add CommunitySidebar with tags, users, topics, AI coach"
```

---

## Stage 4 — Wire Everything into CommunityPage

### Task 10: Two-column layout + Hero + mobile chips + tag filter

**Files:**
- Modify: `frontend/src/pages/CommunityPage.tsx`

- [ ] **Step 1: Add imports** — add to the existing import block at the top of `CommunityPage.tsx`:

```tsx
import CommunityHero from '../components/community/CommunityHero';
import CommunitySidebar from '../components/community/CommunitySidebar';
```

- [ ] **Step 2: Add tag filter state** — inside `export default function CommunityPage()`, after the existing state declarations, add:

```tsx
const [activeTag, setActiveTag] = useState<string | null>(null);
```

- [ ] **Step 3: Update `fetchPosts`** to support tag filtering — change the existing `fetchPosts` function:

```tsx
const fetchPosts = useCallback(async (cat: string, pg: number, tag?: string | null) => {
  setLoading(true);
  try {
    const params = new URLSearchParams({ page: String(pg), limit: '15' });
    if (cat !== 'all') params.set('category', cat);
    if (tag) params.set('tag', tag);
    const { data } = await api.get(`/posts?${params}`);
    setPosts(pg === 1 ? data.posts : prev => [...prev, ...data.posts]);
    setTotalPages(data.pages);
  } catch { toast.error('Failed to load posts'); }
  finally { setLoading(false); }
}, []);
```

- [ ] **Step 4: Update `useEffect` calls** to pass `activeTag`:

```tsx
useEffect(() => { setPage(1); fetchPosts(category, 1, activeTag); }, [category, activeTag]);
useEffect(() => { if (page > 1) fetchPosts(category, page, activeTag); }, [page]);
```

- [ ] **Step 5: Add `onTagClick` handler** — inside `CommunityPage`, after the `onBlock` function:

```tsx
const onTagClick = (tag: string) => {
  setActiveTag(prev => prev === tag ? null : tag);
  setCategory('all');
  setPage(1);
};
```

- [ ] **Step 6: Replace the `<main>` content** — find the existing `<main>` block (around line 816) and replace its contents with the new layout. The full `<main>` should become:

```tsx
<main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pb-20 pt-4 flex flex-col gap-4">

  {/* Hero */}
  <CommunityHero isLoggedIn={isLoggedIn} onPost={handleCreate} />

  {/* Mobile chips: tags — only shown on small screens */}
  <div className="flex lg:hidden gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
    {activeTag && (
      <button
        onClick={() => setActiveTag(null)}
        className="flex-shrink-0 px-3 py-1.5 rounded-xl t-label border transition-all"
        style={{ backgroundColor: 'rgba(0,212,255,0.10)', borderColor: 'rgba(0,212,255,0.35)', color: '#00D4FF' }}>
        ✕ #{activeTag}
      </button>
    )}
    {CATEGORIES_FILTER.map(c => (
      <button key={c} onClick={() => setCategory(c)}
        className="flex-shrink-0 px-3 py-1.5 rounded-xl t-label border transition-all"
        style={{
          backgroundColor: category === c ? 'rgba(0,212,255,0.10)' : ts.cardBg,
          borderColor: category === c ? 'rgba(0,212,255,0.35)' : ts.border,
          color: category === c ? '#00D4FF' : ts.textMuted,
        }}>
        {c}
      </button>
    ))}
  </div>

  <div className="flex gap-5">

    {/* Feed */}
    <div className="flex-1 min-w-0 flex flex-col gap-4">

      {/* Category filter pills — desktop only */}
      <div className="hidden lg:flex gap-1.5 flex-wrap">
        {activeTag && (
          <button onClick={() => setActiveTag(null)}
            className="px-3 py-1.5 rounded-xl t-label border transition-all"
            style={{ backgroundColor: 'rgba(0,212,255,0.10)', borderColor: 'rgba(0,212,255,0.35)', color: '#00D4FF' }}>
            ✕ #{activeTag}
          </button>
        )}
        {CATEGORIES_FILTER.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className="px-3 py-1.5 rounded-xl t-label border transition-all"
            style={{
              backgroundColor: category === c ? 'rgba(0,212,255,0.10)' : ts.cardBg,
              borderColor: category === c ? 'rgba(0,212,255,0.35)' : ts.border,
              color: category === c ? '#00D4FF' : ts.textMuted,
            }}>
            {t(`community.categories.${c}`, c)}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading && page === 1 ? (
        <ListSkeleton count={4} />
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <span className="text-4xl opacity-30">🌊</span>
          <p className="t-body" style={{ color: ts.textMuted }}>{t("community.noPostsYet")}</p>
          <button onClick={handleCreate}
            className="px-6 py-2.5 rounded-full t-body text-white font-medium transition-all hover:shadow-[0_0_20px_rgba(58,130,247,0.4)]"
            style={{ background: ts.btnGradient }}>
            Write a post →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post, i) => (
            <div key={post._id} className="comm-in" style={{ animationDelay: `${Math.min(i, 5) * 0.05}s`, opacity: 0 }}>
              <PostCard post={post} isLoggedIn={isLoggedIn} currentUserId={currentUserId}
                onLoginRequired={() => setShowLogin(true)} onDelete={onDelete} onBlock={onBlock} />
            </div>
          ))}

          {page < totalPages && (
            <button onClick={() => setPage(p => p + 1)} disabled={loading}
              className="self-center px-6 py-2.5 rounded-full t-caption transition-all disabled:opacity-40 mt-2"
              style={{ color: ts.textSecondary, border: `1px solid ${ts.border}` }}>
              {loading ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      )}

      {posts.length > 5 && <AdSlot className="h-14" />}
    </div>

    {/* Sidebar */}
    <CommunitySidebar onTagClick={onTagClick} />
  </div>
</main>
```

- [ ] **Step 7: Remove the old `<aside>` block** — the old sidebar (lines ~876–920 with About, Stats, Rules sections) is now replaced by `CommunitySidebar`. Delete everything between `{/* Sidebar */}` and the closing `</div>` of the flex container that ends before `</main>`.

- [ ] **Step 8: Remove the old `+ Post` button from the header** — it's now in the Hero. Find and delete this block in the `<header>`:
```tsx
<button onClick={handleCreate}
  className="flex items-center gap-2 px-5 py-2.5 rounded-full ...">
  <Plus size={14} /> Post
</button>
```
Also remove the `Plus` import from lucide-react if no longer used.

- [ ] **Step 9: Verify in browser**:
  - Desktop (≥1024px): Hero across full width, feed + sidebar side by side
  - Mobile (<1024px): Hero → horizontal chips → feed (sidebar hidden)
  - Click a tag in sidebar → feed filters, active tag chip appears in filter bar
  - Click ✕ chip → filter clears

- [ ] **Step 10: Commit**
```bash
git add frontend/src/pages/CommunityPage.tsx
git commit -m "feat(community): wire Hero + Sidebar + tag filter into two-column layout"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** SEO route ✓, Hero stats ✓, Sidebar (tags, users, topics, AI coach) ✓, two-column layout ✓, mobile chips ✓, tag filtering ✓
- [x] **No placeholders:** All steps have full code
- [x] **Type consistency:** `Post`, `Author`, `SidebarData` defined consistently across files; `TAG_PALETTE` duplicated intentionally in `CommunityPostPage` and `CommunitySidebar` (no shared dep needed)
- [x] **Route order:** `GET /:id` in posts.js must be placed BEFORE `DELETE /:id` — noted in Task 1 Step 1
- [x] **`/api/posts?tag=` filter:** already supported by the existing `GET /api/posts` handler (`if (tag) filter.tags = tag`) — no backend change needed
