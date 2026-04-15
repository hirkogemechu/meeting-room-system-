const request = require('supertest');
const app = require('../../../src/app');

describe('Auth Flow', () => {
  jest.setTimeout(15000);

  it('register → login → me flow', async () => {
    const email = `test${Date.now()}@mail.com`;

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test',
        email,
        password: 'Test123456'
      });

    expect(registerRes.status).toBe(201);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email,
        password: 'Test123456'
      });

    expect(loginRes.status).toBe(200);

    const token = loginRes.body?.data?.accessToken;
    expect(token).toBeDefined();

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
  });
});
