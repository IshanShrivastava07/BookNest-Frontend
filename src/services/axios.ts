import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[AXIOS INTERCEPTOR] Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      hasResponse: !!error.response,
      tokenInStorage: !!localStorage.getItem('token')
    });
    if (error.response?.status === 401) {
      console.error('[AXIOS INTERCEPTOR] 401 detected on', error.config?.url);
      // Don't auto-redirect — let ProtectedRoute handle auth flow
      // This prevents losing debug info on redirect
    }
    return Promise.reject(error);
  }
);

export default api;
