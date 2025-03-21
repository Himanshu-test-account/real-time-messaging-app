import { create } from 'zustand';
import { api } from '../services/api';
import { jwtDecode } from 'jwt-decode';

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('token') || null,
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // ✅ Check Authentication Status
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }
    
    try {
      // Check token expiration
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem('token');
        set({ isAuthenticated: false, user: null, token: null });
        return;
      }
      
      // Fetch user details using protected `/auth/current` route
      // Changed from /auth/me to /auth/current to match the backend endpoint
      set({ loading: true });
      const response = await api.get('/auth/current', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      set({
        isAuthenticated: true,
        user: response.data,
        token,
        error: null,
        loading: false,
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        error: 'Authentication failed',
        loading: false,
      });
    }
  },

  // ✅ Register User
  register: async (userData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      set({
        isAuthenticated: true,
        user,
        token,
        error: null,
        loading: false,
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Registration failed';
      
      set({
        isAuthenticated: false,
        error: errorMessage,
        loading: false,
      });
      
      return false;
    }
  },

  // ✅ Login User
  login: async (credentials) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      set({
        isAuthenticated: true,
        user,
        token,
        error: null,
        loading: false,
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Login failed';
      
      set({
        isAuthenticated: false,
        error: errorMessage,
        loading: false,
      });
      
      return false;
    }
  },

  // ✅ Logout User
  logout: async () => {
    try {
      const headers = { Authorization: `Bearer ${get().token}` };
      await api.post('/auth/logout', {}, { headers });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      });
    }
  },
  
  // ✅ Refresh Token
  refreshToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const refreshToken = token; // You might need to store refresh token separately
      const response = await api.post('/auth/refresh', { refreshToken });
      const { accessToken } = response.data;
      
      localStorage.setItem('token', accessToken);
      
      set({
        token: accessToken,
        error: null,
      });
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      localStorage.removeItem('token');
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        error: 'Session expired. Please login again.',
      });
      
      return false;
    }
  },

  // ✅ Clear Errors
  clearError: () => set({ error: null }),
}));