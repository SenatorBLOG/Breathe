// Rate-limit behaviour test. Sets a LOW login cap BEFORE the app is required
// (Jest gives each test file a fresh module registry, so this doesn't leak
// into other files).
process.env.LOGIN_RATE_MAX = '3';

const request = require('supertest');
const { setupTestApp, teardown } = require('./helpers');

let app, mongod;

beforeAll(async () => {
  ({ app, mongod } = await setupTestApp());
});

afterAll(() => teardown(mongod));

describe('login rate limiting', () => {
  it('returns 429 after the per-IP cap is exhausted', async () => {
    const attempt = () =>
      request(app)
        .post('/api/auth/login')
        .send({ email: 'brute@example.com', password: 'wrong-password' });

    for (let i = 0; i < 3; i++) {
      const res = await attempt();
      expect(res.status).toBe(400); // wrong creds, but not limited yet
    }

    const blocked = await attempt();
    expect(blocked.status).toBe(429);
  });
});

describe('health endpoints', () => {
  it('GET /api/ping responds', async () => {
    const res = await request(app).get('/api/ping');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('GET /healthz reports mongo + jwt as healthy', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body.required.mongo).toBe(true);
    expect(res.body.required.jwt).toBe(true);
  });
});
