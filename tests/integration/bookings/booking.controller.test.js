const request = require('supertest');
const app = require('../../../src/app');

describe('Booking API', () => {
  let token;
  let roomId;

  beforeAll(async () => {
    // LOGIN AS ADMIN
    const login = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@meetingpro.com',
        password: 'Admin123456'
      });

    token = login.body?.data?.accessToken;
    expect(token).toBeDefined();

    // CREATE ROOM
    const roomRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: `R-${Date.now()}`,
        capacity: 10
      });

    console.log("ROOM RESPONSE:", JSON.stringify(roomRes.body, null, 2));

    expect(roomRes.status).toBe(201);

    roomId = roomRes.body?.data?.id || roomRes.body?.data?.room?.id;
    expect(roomId).toBeDefined();
  });

  it('should create booking', async () => {
    // FIX: use valid future ISO timestamps
    const startTime = new Date(Date.now() + 60000); // 1 min in future
    const endTime = new Date(Date.now() + 3600000);  // +1 hour

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        roomId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });

    console.log("BOOKING RESPONSE:", JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
