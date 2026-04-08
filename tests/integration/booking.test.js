const request = require('supertest');
const app = require('../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Booking System - Integration Tests', () => {
  let adminToken = '';
  let userToken = '';
  let testRoomId = '';
  let testBookingId = '';
  
  const adminUser = {
    name: 'Test Admin',
    email: `admin${Date.now()}@example.com`,
    password: 'Admin123456',
    role: 'ADMIN'
  };
  
  const regularUser = {
    name: 'Test User',
    email: `user${Date.now()}@example.com`,
    password: 'User123456',
    role: 'USER'
  };

  beforeAll(async () => {
    // Clean up before tests
    await prisma.booking.deleteMany({}).catch(() => {});
    await prisma.room.deleteMany({}).catch(() => {});
    await prisma.user.deleteMany({ where: { email: { contains: 'test' } } }).catch(() => {});
    
    // Create admin user
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send(adminUser);
    adminUser.id = adminRes.body.data.user.id;
    
    // Make user admin in database
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { role: 'ADMIN' }
    });
    
    // Login as admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: 'Admin123456' });
    adminToken = adminLogin.body.data.accessToken;
    
    // Create regular user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send(regularUser);
    regularUser.id = userRes.body.data.user.id;
    
    // Login as regular user
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: regularUser.email, password: 'User123456' });
    userToken = userLogin.body.data.accessToken;
    
    // Create a test room
    const roomRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Test Room ${Date.now()}`,
        capacity: 10,
        equipment: ['Projector', 'Whiteboard']
      });
    testRoomId = roomRes.body.data.id;
  }, 30000);

  describe('POST /api/bookings', () => {
    it('should create a booking successfully', async () => {
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + 1);
      startTime.setHours(10, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(12, 0, 0, 0);
      
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          roomId: testRoomId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        })
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.status).toBe('ACTIVE');
      
      testBookingId = response.body.data.id;
    }, 15000);

    it('should return 409 for overlapping booking', async () => {
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + 1);
      startTime.setHours(10, 30, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(12, 30, 0, 0);
      
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          roomId: testRoomId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        })
        .expect(409);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already booked');
    }, 15000);

it.skip('should return 404 for non-existent room', async () => {
  // Use a valid MongoDB/CUID format ID that doesn't exist in database
  const nonExistentId = 'c0ffee000000000000000000'; // Valid format but doesn't exist
  
  const response = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      roomId: nonExistentId,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString()
    })
    .expect(404);
  
  expect(response.body.success).toBe(false);
  expect(response.body.message).toContain('Room not found');
}, 15000);
  });

  describe('GET /api/bookings/my-bookings', () => {
    it('should return user bookings', async () => {
      const response = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    }, 15000);
  });

  describe('PUT /api/bookings/:id/cancel', () => {
    it('should cancel a booking successfully', async () => {
      const response = await request(app)
        .put(`/api/bookings/${testBookingId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('cancelled');
    }, 15000);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.booking.deleteMany({ where: { roomId: testRoomId } }).catch(() => {});
    await prisma.room.delete({ where: { id: testRoomId } }).catch(() => {});
    await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: regularUser.id } }).catch(() => {});
    await prisma.$disconnect();
  }, 30000);
});