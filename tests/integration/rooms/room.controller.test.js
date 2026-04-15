const request = require('supertest');
const app = require('../../../src/app');

describe('Room API', () => {
  let adminToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@meetingpro.com',
        password: 'Admin123456'
      });

    adminToken = res.body.data.accessToken;
  });

  it('should create room', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Room ${Date.now()}`,
        capacity: 10
      })
      .expect(201);

    expect(res.body.data.id).toBeDefined();
  });

  it('should block unauthorized user', async () => {
    await request(app)
      .post('/api/rooms')
      .send({ name: 'Test', capacity: 5 })
      .expect(401);
  });
});
