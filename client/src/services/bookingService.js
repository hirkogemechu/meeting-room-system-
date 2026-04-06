import api from './api';

const bookingService = {
  async createBooking(bookingData) {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  async getUserBookings() {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  async cancelBooking(id) {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },

  async getAllBookings() {
    const response = await api.get('/bookings');
    return response.data;
  },

  async exportBookings(format = 'csv') {
    const response = await api.get(`/bookings/export?format=${format}`, {
      responseType: 'blob',
    });
    return response;
  }
};

export default bookingService;