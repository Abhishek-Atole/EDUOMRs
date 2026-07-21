import { create } from 'zustand';
import axios from 'axios';
import api from '../services/api.js';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    set({ user: data.data.user, isAuthenticated: true });
    return data.data.user;
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch { /* ignore */ }
    localStorage.clear();
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    set({ isLoading: true });
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp > now) {
        set({
          user: { id: payload.sub, email: payload.email, firstName: payload.firstName, lastName: payload.lastName, role: payload.role, tenantId: payload.tenantId },
          isAuthenticated: true, isLoading: false,
        });
        return;
      }
      if (!refreshToken) {
        localStorage.clear();
        set({ isLoading: false });
        return;
      }
      const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken });
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      const newPayload = JSON.parse(atob(data.data.accessToken.split('.')[1]));
      set({
        user: { id: newPayload.sub, email: newPayload.email, firstName: newPayload.firstName, lastName: newPayload.lastName, role: newPayload.role, tenantId: newPayload.tenantId },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (e) {
      localStorage.clear();
      set({ isLoading: false });
    }
  },
}));
