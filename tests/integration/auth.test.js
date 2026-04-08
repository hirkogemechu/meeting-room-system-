const request = require('supertest');
const app = require('../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Authentication Flow - Integration Tests', () => {
  let testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'Test123456'
  };
  
  let accessToken = '';

  // Clean up before tests
  beforeAll(async () => {
    // Clean any existing test users
    await prisma.user.deleteMany({
      where: { email: { contains: 'test' } }
    }).catch(() => {});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.role).toBe('USER');
      expect(response.body.data).toHaveProperty('accessToken');
      
      testUser.id = response.body.data.user.id;
    }, 10000);

    it('should return 409 when email already exists', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    }, 10000);

    it('should return 422 when validation fails', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'a', email: 'invalid', password: '123' })
        .expect(422);
      
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(422);
    }, 10000);
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'Test123456'
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data).toHaveProperty('accessToken');
      
      accessToken = response.body.data.accessToken;
    }, 10000);

    it('should return 401 with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123'
        })
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    }, 10000);

    it('should return 401 with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123456'
        })
        .expect(401);
      
      expect(response.body.success).toBe(false);
    }, 10000);
  });

  describe('GET /api/auth/me', () => {
    it('should return user info with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
    }, 10000);

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not authorized, no token');
    }, 10000);
  });

  // Clean up after tests
  afterAll(async () => {
    if (testUser.id) {
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  }, 15000);
});