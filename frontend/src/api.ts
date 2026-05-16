/// <reference types="vite/client" />
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'https://breathe-api-amut.onrender.com/api',
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

// ── Handle 401 globally ──────────────────────────────────────────────────────
// Rule: a 401 means the token is stale or invalid. Always clear it so we stop
// sending it on the next request. Then decide whether to redirect:
//   - Private routes (profile, sessions, statistics) → redirect to /login so
//     the user is told their session expired instead of staring at empty UI.
//   - Public routes (/, /breathing, /community, /faq, /support, /music-library,
//     /login, /signup) → no redirect; the page renders fine for guests.
const PRIVATE_ROUTE_PREFIXES = ['/profile', '/sessions', '/statistics', '/data-consent', '/onboarding'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear ALL auth state — token, user object (email/id), and any cached user prefs.
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('user');

      const currentPath = window.location.pathname;
      const onPrivateRoute = PRIVATE_ROUTE_PREFIXES.some(p => currentPath.startsWith(p));
      // Avoid loops if we somehow 401 on the login page itself.
      const alreadyOnAuth = currentPath === '/login' || currentPath === '/signup';

      if (onPrivateRoute && !alreadyOnAuth) {
        window.location.href = `/login?expired=1&next=${encodeURIComponent(currentPath + window.location.search)}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;