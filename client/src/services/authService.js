import api from './api';

const authService = {
  // ==================== AUTHENTICATION METHODS ====================
  
  async register(userData) {
    try {
      console.log('Registering user:', userData.email);
      const response = await api.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      return error.response?.data || { success: false, message: 'Registration failed' };
    }
  },

  async login(credentials) {
    try {
      console.log('Logging in:', credentials.email);
      const response = await api.post('/auth/login', credentials);
      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return error.response?.data || { success: false, message: 'Login failed' };
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getCurrentUserFromStorage() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  },

  getToken() {
    return localStorage.getItem('accessToken');
  },

  // ==================== USER MANAGEMENT METHODS (ADMIN ONLY) ====================
  
  // Get all users (Admin only)
  async getAllUsers() {
    try {
      console.log('📡 Fetching users from API...');
      const response = await api.get('/auth/users');
      console.log('✅ Users API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      return { success: false, data: [], message: error.response?.data?.message || 'Failed to fetch users' };
    }
  },

  // Get user by ID (Admin only)
  async getUserById(id) {
    try {
      const response = await api.get(`/auth/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return { success: false, data: null };
    }
  },

  // Update user role (Admin only)
  async updateUserRole(id, role) {
    try {
      console.log(`📡 Updating user ${id} role to ${role}...`);
      const response = await api.put(`/auth/users/${id}/role`, { role });
      console.log('✅ Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update role' };
    }
  },

  // Delete user (Admin only)
  async deleteUser(id) {
    try {
      const response = await api.delete(`/auth/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete user' };
    }
  },

  // Get user statistics (Admin only)
  async getUserStats() {
    try {
      const response = await api.get('/auth/users/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { success: false, data: null };
    }
  }
};

export default authService;