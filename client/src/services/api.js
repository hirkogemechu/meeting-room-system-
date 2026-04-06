import axios from 'axios';

// Clean the URL to remove any spaces
const rawUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const API_URL = rawUrl.trim();

console.log('🔗 Backend API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error('Response error:', error.response?.status, error.message);
    
    if (!error.response) {
      console.error('❌ Cannot connect to backend. Make sure server is running on port 3000');
      return Promise.reject(new Error('Cannot connect to server. Backend might not be running.'));
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;