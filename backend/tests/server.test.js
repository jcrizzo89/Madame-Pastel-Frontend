const request = require('supertest');
const app = require('../server');

describe('Server & Health Endpoints', () => {
  it('GET / should return 200 with running message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Madame Pastel API is running');
  });

  it('GET /health should report the API as unavailable when MongoDB is disconnected', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(503);
    expect(res.body).toHaveProperty('status', 'unavailable');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('database', 'disconnected');
  });

  it('Security: Helmet headers should be present', async () => {
    const res = await request(app).get('/health');
    expect(res.headers).toHaveProperty('x-dns-prefetch-control');
    expect(res.headers).toHaveProperty('x-frame-options');
    expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
  });
});
