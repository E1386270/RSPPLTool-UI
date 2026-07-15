/**
 * Axios Configuration Service
 * Configures axios with Okta access token authorization
 */

import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { getAccessToken } from './tokenManager';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create();

/**
 * Request interceptor: Attach Okta access token to all API requests
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      if (typeof config.headers?.set === 'function') {
        config.headers.set('Authorization', `Bearer ${accessToken}`);
      } else {
        config.headers = {
          ...(config.headers ?? {}),
          Authorization: `Bearer ${accessToken}`,
        } as InternalAxiosRequestConfig['headers'];
      }
    }

    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle auth errors (401, 403)
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: { response?: { status?: number } }) => {
    // Log auth errors
    if (error.response?.status === 401) {
      console.warn('Unauthorized (401): Token may be expired or invalid');
      // Token manager/App.tsx should handle token refresh
    }

    if (error.response?.status === 403) {
      console.warn('Forbidden (403): User lacks permission for this resource');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
