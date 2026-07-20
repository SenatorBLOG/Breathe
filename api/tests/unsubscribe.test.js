const request = require('supertest');
const { setupTestApp, teardown } = require('./helpers');

let app, mongod, User;
const EMAIL = 'unsub-me@example.com';

beforeAll(async () => {
  ({ app, mongod } = await setupTestApp());
  User = require('../models/User');
  await request(app).post('/api/auth/register')
    .send({ email: EMAIL, password: 'password123', name: 'Unsub' });
});

afterAll(() => teardown(mongod));

describe('GET /api/unsubscribe — signed links', () => {
  it('rejects an unsigned link (the "unsubscribe anyone" hole)', async () => {
    const res = await request(app)
      .get('/api/unsubscribe')
      .query({ email: EMAIL, type: 'reminder' });
    expect(res.status).toBe(403);

    const user = await User.findOne({ email: EMAIL }).lean();
    expect(user.emailPreferences.reminder).toBe(true); // untouched
  });

  it('rejects a forged signature', async () => {
    const res = await request(app)
      .get('/api/unsubscribe')
      .query({ email: EMAIL, type: 'reminder', sig: 'f'.repeat(32) });
    expect(res.status).toBe(403);
  });

  it('accepts a properly signed link and flips only that preference', async () => {
    // Sign AFTER setupTestApp so the helper sees the test JWT_SECRET
    const { sign } = require('../utils/unsubSign');
    const res = await request(app)
      .get('/api/unsubscribe')
      .query({ email: EMAIL, type: 'reminder', sig: sign(EMAIL, 'reminder') });
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/unsubscribed/i);

    const user = await User.findOne({ email: EMAIL }).lean();
    expect(user.emailPreferences.reminder).toBe(false);
    expect(user.emailPreferences.weekly).toBe(true); // other pref untouched
  });

  it('email templates embed a valid signature', () => {
    const { welcomeHtml } = require('../emails/welcome');
    const { sign } = require('../utils/unsubSign');
    const html = welcomeHtml({ name: 'X', email: EMAIL });
    expect(html).toContain(`sig=${sign(EMAIL, 'welcome')}`);
  });
});
