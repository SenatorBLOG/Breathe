/// <reference types="vite/client" />
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'https://breathe-production-6cce.up.railway.app/api',
  timeout: 10000,
});

// ── Attach token to every request ─────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Handle 401 globally — clear stale token and redirect to login ─────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Don't redirect if already on auth pages
      const noRedirectPaths = ['/login', '/signup', '/', '/breathing', '/community', '/faq', '/support', '/home-page', '/music-library'];
      if (!noRedirectPaths.some(p => currentPath.startsWith(p))) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        // Soft redirect — don't use navigate() here since we're outside React
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;