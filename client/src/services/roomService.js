import api from './api';

const roomService = {
  // Get all rooms with optional filters
  async getAllRooms(params = {}) {
    const response = await api.get('/rooms', { params });
    return response.data;
  },

  // Get single room by ID
  async getRoomById(id) {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  // Create new room (Admin only)
  async createRoom(roomData) {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  // Update existing room (Admin only)
  async updateRoom(id, roomData) {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  // Delete room (Admin only)
  async deleteRoom(id) {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },

  // Get room statistics
  async getRoomStats(id) {
    const response = await api.get(`/rooms/${id}/stats`);
    return response.data;
  }
};

export default roomService;