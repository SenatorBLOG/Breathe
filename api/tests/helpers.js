// Shared test bootstrap. Each Jest test file gets a fresh module registry, so
// every file calls setupTestApp() in beforeAll — env vars MUST be set before
// `require('../app')` because route modules read them at require time.
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

async function setupTestApp() {
  const mongod = await MongoMemoryServer.create();

  process.env.NODE_ENV   = 'test';
  process.env.MONGO_URI  = mongod.getUri();
  process.env.JWT_SECRET = 'test-secret-not-for-production';
  // Effectively disable rate limits unless a test file lowered them on purpose
  process.env.LOGIN_RATE_MAX    = process.env.LOGIN_RATE_MAX    || '1000';
  process.env.REGISTER_RATE_MAX = process.env.REGISTER_RATE_MAX || '1000';
  process.env.GLOBAL_RATE_MAX   = '100000';

  const app = require('../app');
  return { app, mongod };
}

async function teardown(mongod) {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

async function registerUser(request, app, { email, password = 'password123', name } = {}) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email, password, name });
  return res;
}

module.exports = { setupTestApp, teardown, registerUser };
