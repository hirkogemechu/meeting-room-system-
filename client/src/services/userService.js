import api from './api';

const userService = {
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

  async getUserById(id) {
    try {
      const response = await api.get(`/auth/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return { success: false, data: null };
    }
  },

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

  async deleteUser(id) {
    try {
      const response = await api.delete(`/auth/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete user' };
    }
  },

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

export default userService;