const request = require('supertest');
const app = require('../../src/app');

describe('Auth Controller - Extra Coverage', () => {
  let adminToken = '';
  let testUserId = '';

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@meetingpro.com', password: 'Admin123456' });
    adminToken = loginRes.body.data.accessToken;
  });

  describe('GET /api/auth/users/:id', () => {
    it('should return user by id for admin', async () => {
      // First get users list to get an ID
      const usersRes = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (usersRes.body.data.length > 0) {
        const userId = usersRes.body.data[0].id;
        const response = await request(app)
          .get(`/api/auth/users/${userId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
        
        expect(response.body.success).toBe(true);
      }
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/auth/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/users/stats', () => {
    it('should return user statistics', async () => {
      const response = await request(app)
        .get('/api/auth/users/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('admins');
      expect(response.body.data).toHaveProperty('users');
    });
  });
});