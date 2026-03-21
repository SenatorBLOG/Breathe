// seeds/communityPosts.js
// Run: node seeds/communityPosts.js
// Inserts 3 SEO-friendly community posts with 2 comments each.
// Safe to run multiple times — checks for existing seed data first.

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');
const Post     = require('../models/Post');
const Comment  = require('../models/Comment');

const SEED_USERS = [
  { email: 'alex.mindful@breathe.seed', name: 'Alex', password: 'SeedPass1!' },
  { email: 'sara.calm@breathe.seed',    name: 'Sara', password: 'SeedPass1!' },
  { email: 'kai.focus@breathe.seed',    name: 'Kai',  password: 'SeedPass1!' },
];

const POSTS = [
  {
    authorIdx: 0,
    category: 'experience',
    tags: ['box-breathing', 'sleep', 'anxiety'],
    text: "I've been doing box breathing every night before bed for 3 weeks now. The difference in how fast I fall asleep is wild — from 40+ minutes of lying awake to maybe 10. The 4-4-4-4 pattern genuinely resets something in my nervous system. Anyone else notice their resting heart rate dropping after a few weeks of consistent practice?",
    comments: [
      { authorIdx: 1, text: "Same experience here! I started with 5 minutes before sleep and now I can't imagine going to bed without it. My Fitbit shows my HRV went up by about 12ms over the first month." },
      { authorIdx: 2, text: "The heart rate thing is real. Mine dropped from 68 to 61 resting after 6 weeks of daily sessions. Box breathing activates the vagus nerve which directly regulates your heart rhythm." },
    ],
  },
  {
    authorIdx: 1,
    category: 'tip',
    tags: ['wim-hof', 'energy', 'morning'],
    text: "Pro tip for anyone doing Wim Hof in the mornings: do it BEFORE coffee, not after. Caffeine raises cortisol and makes the breathwork feel more anxious than energising. On an empty stomach the retention phase feels much cleaner and the energy boost lasts longer. 30 rounds + 2 min cold shower = best morning stack I've found.",
    comments: [
      { authorIdx: 0, text: "Game changer advice. I was doing it post-coffee and wondering why I felt jittery. Switched to pre-coffee and the calm-energy feeling is completely different. Thanks!" },
      { authorIdx: 2, text: "Adding to this — try doing the retention phase lying down with a pillow under your knees. Grounding your lower back releases a lot of tension and the hold feels effortless for much longer." },
    ],
  },
  {
    authorIdx: 2,
    category: 'achievement',
    tags: ['streak', 'consistency', 'habit'],
    text: "30-day streak unlocked. Honestly didn't think I'd make it past week one. What kept me going: I stopped treating it as a meditation practice and started treating it as brushing my teeth. Non-negotiable, 5 minutes minimum, same time every day. Some sessions were 3 breaths before I fell asleep. That still counts. Consistency beats intensity every time.",
    comments: [
      { authorIdx: 0, text: "Congratulations! The 'brushing teeth' reframe is exactly right. I hit 47 days last month using the same mindset. The app's streak counter really helps — that little number becomes oddly motivating." },
      { authorIdx: 1, text: "This is so true. I used to skip days when I was tired because I thought a 'bad session' wasn't worth it. Now I do even 2 minutes and the streak stays alive. The habit is the point, not the perfect session." },
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Check if already seeded
  const existing = await User.findOne({ email: SEED_USERS[0].email });
  if (existing) {
    console.log('Seed data already exists — skipping. Delete seed users to re-run.');
    await mongoose.disconnect();
    return;
  }

  // Create seed users (without hashing — use model pre-save hook)
  const users = [];
  for (const u of SEED_USERS) {
    const user = await User.create({ ...u, authType: 'password' });
    users.push(user);
    console.log(`Created user: ${u.name} (${u.email})`);
  }

  // Create posts + comments
  for (const p of POSTS) {
    const post = await Post.create({
      author:   users[p.authorIdx]._id,
      text:     p.text,
      category: p.category,
      tags:     p.tags,
      likes:    [users[(p.authorIdx + 1) % 3]._id, users[(p.authorIdx + 2) % 3]._id],
    });
    console.log(`Created post by ${SEED_USERS[p.authorIdx].name}: "${p.text.slice(0, 50)}…"`);

    for (const c of p.comments) {
      await Comment.create({
        post:   post._id,
        author: users[c.authorIdx]._id,
        text:   c.text,
        likes:  [users[p.authorIdx]._id],
      });
      console.log(`  └─ Comment by ${SEED_USERS[c.authorIdx].name}`);
    }
  }

  console.log('\nSeed complete — 3 posts, 6 comments inserted.');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
