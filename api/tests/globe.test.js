const request = require('supertest');
const { setupTestApp, teardown } = require('./helpers');

let app, mongod;
let tokenA, tokenB;

const PIN = {
  lat: 49.28312,
  lng: -123.12093,
  city: 'Vancouver',
  country: 'Canada',
  technique: 'box',
  note: 'Morning session by the water',
};

beforeAll(async () => {
  ({ app, mongod } = await setupTestApp());

  const a = await request(app).post('/api/auth/register')
    .send({ email: 'owner@example.com', password: 'password123', name: 'Alice' });
  const b = await request(app).post('/api/auth/register')
    .send({ email: 'viewer@example.com', password: 'password123', name: 'Bob' });
  tokenA = a.body.token;
  tokenB = b.body.token;
});

afterAll(() => teardown(mongod));

describe('POST /api/globe', () => {
  it('requires auth', async () => {
    const res = await request(app).post('/api/globe').send(PIN);
    expect(res.status).toBe(401);
  });

  it('rejects out-of-range coordinates', async () => {
    const res = await request(app)
      .post('/api/globe')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ ...PIN, lat: 999 });
    expect(res.status).toBe(400);
  });

  it('creates a pin for an authenticated user', async () => {
    const res = await request(app)
      .post('/api/globe')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(PIN);
    expect(res.status).toBe(201);
    expect(res.body.lat).toBe(PIN.lat);
  });
});

describe('GET /api/globe — location privacy', () => {
  it('coarsens coordinates and redacts username for anonymous viewers', async () => {
    const res = await request(app).get('/api/globe');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);

    const pin = res.body[0];
    // ~1.1 km grid, never the exact spot
    expect(pin.lat).toBe(49.28);
    expect(pin.lng).toBe(-123.12);
    // 'Alice' must not be published verbatim
    expect(pin.username).toBe('A.');
  });

  it('coarsens for a DIFFERENT authenticated user too', async () => {
    const res = await request(app)
      .get('/api/globe')
      .set('Authorization', `Bearer ${tokenB}`);
    expect(res.body[0].lat).toBe(49.28);
    expect(res.body[0].username).toBe('A.');
  });

  it('shows the owner their own pin at full precision', async () => {
    const res = await request(app)
      .get('/api/globe')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.body[0].lat).toBe(49.28312);
    expect(res.body[0].username).toBe('Alice');
  });

  it('never leaks userId to anyone — owner included', async () => {
    for (const token of [null, tokenA, tokenB]) {
      const req = request(app).get('/api/globe');
      if (token) req.set('Authorization', `Bearer ${token}`);
      const res = await req;
      expect(res.body[0]).not.toHaveProperty('userId');
    }
  });
});

describe('DELETE /api/globe/:id', () => {
  it('forbids deleting someone else’s pin, allows the owner', async () => {
    const list = await request(app)
      .get('/api/globe')
      .set('Authorization', `Bearer ${tokenA}`);
    const id = list.body[0]._id;

    const forbidden = await request(app)
      .delete(`/api/globe/${id}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(forbidden.status).toBe(403);

    const ok = await request(app)
      .delete(`/api/globe/${id}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(ok.status).toBe(200);

    const after = await request(app).get('/api/globe');
    expect(after.body).toHaveLength(0);
  });
});

describe('POST /api/globe/resolve-place — SSRF guard', () => {
  it('rejects non-Google hosts even when the URL mentions goo.gl', async () => {
    process.env.GOOGLE_MAPS_API_KEY = 'test-key';
    const res = await request(app)
      .post('/api/globe/resolve-place')
      .send({ url: 'https://169.254.169.254/latest/meta-data/?goo.gl' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Google Maps/i);
  });

  it('rejects plain http links', async () => {
    process.env.GOOGLE_MAPS_API_KEY = 'test-key';
    const res = await request(app)
      .post('/api/globe/resolve-place')
      .send({ url: 'http://goo.gl/abc' });
    expect(res.status).toBe(400);
  });
});
