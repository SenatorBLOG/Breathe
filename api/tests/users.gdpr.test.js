const request = require('supertest');
const { setupTestApp, teardown } = require('./helpers');

let app, mongod;
let token, otherToken, userId, otherId;
let User, Session, Post, Comment, GlobePin;

beforeAll(async () => {
  ({ app, mongod } = await setupTestApp());
  // Require AFTER setupTestApp so models bind to the in-memory connection
  User     = require('../models/User');
  Session  = require('../models/Session');
  Post     = require('../models/Post');
  Comment  = require('../models/Comment');
  GlobePin = require('../models/GlobePin');

  const a = await request(app).post('/api/auth/register')
    .send({ email: 'erase-me@example.com', password: 'password123', name: 'Erased' });
  const b = await request(app).post('/api/auth/register')
    .send({ email: 'bystander@example.com', password: 'password123', name: 'Bystander' });
  token      = a.body.token;
  otherToken = b.body.token;
  userId     = a.body.user.id;
  otherId    = b.body.user.id;
});

afterAll(() => teardown(mongod));

describe('GET /api/users/me/export (GDPR Art. 20)', () => {
  it('requires auth', async () => {
    const res = await request(app).get('/api/users/me/export');
    expect(res.status).toBe(401);
  });

  it('returns every category of the user’s data', async () => {
    // Seed one record of each type
    await Session.create({ userId, sessionLength: 5, cycles: 10 });
    await GlobePin.create({ userId, username: 'Erased', lat: 10, lng: 20 });
    const post = await Post.create({ author: userId, text: 'My first post' });
    await Comment.create({ post: post._id, author: userId, text: 'my own comment' });

    const res = await request(app)
      .get('/api/users/me/export')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
    expect(res.body.account.email).toBe('erase-me@example.com');
    expect(res.body.account.password).toBeUndefined();
    expect(res.body.breathingSessions).toHaveLength(1);
    expect(res.body.globePins).toHaveLength(1);
    expect(res.body.communityPosts).toHaveLength(1);
    expect(res.body.communityComments).toHaveLength(1);
  });
});

describe('DELETE /api/users/me (GDPR Art. 17)', () => {
  it('cascade-deletes all user data but leaves other users intact', async () => {
    // Bystander posts something; erased user comments on it.
    const bypost = await Post.create({ author: otherId, text: 'bystander post' });
    await Comment.create({ post: bypost._id, author: userId, text: 'erased user comment elsewhere' });
    // Bystander comments on the erased user's post
    const myPost = await Post.findOne({ author: userId });
    await Comment.create({ post: myPost._id, author: otherId, text: 'bystander comment on doomed post' });

    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    // Everything belonging to the user is gone
    expect(await User.findById(userId)).toBeNull();
    expect(await Session.countDocuments({ userId })).toBe(0);
    expect(await GlobePin.countDocuments({ userId })).toBe(0);
    expect(await Post.countDocuments({ author: userId })).toBe(0);
    expect(await Comment.countDocuments({ author: userId })).toBe(0);
    // Comments on the user's posts are gone too (orphan prevention)
    expect(await Comment.countDocuments({ post: myPost._id })).toBe(0);

    // The bystander survives untouched
    expect(await User.findById(otherId)).not.toBeNull();
    expect(await Post.countDocuments({ author: otherId })).toBe(1);
  });

  it('the deleted user’s token no longer resolves a profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
