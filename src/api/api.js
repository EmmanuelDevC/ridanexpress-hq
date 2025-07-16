// src/api/api.js
import axios from 'axios';
import store from '../store'; // Default import
import { logoutUser, updateToken } from '../store/Reducers/authReducer'; // Named imports

const API_BASE_URL = 'https://martafrik-api.onrender.com';
// const API_BASE_URL = 'http://localhost:5000';
const HMAC_SECRET = process.env.REACT_APP_HMAC_SECRET; 
const REQUEST_TIMEOUT = 15000;
const MAX_RETRIES = 2;

// Create secure Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  }
});

// HMAC generation using Web Crypto API
async function generateHMAC(payload, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const data = encoder.encode(JSON.stringify(payload));
  const signature = await crypto.subtle.sign("HMAC", key, data);
  
  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    if (HMAC_SECRET) {
      const requestData = config.data || {};
      const timestamp = Date.now();
      const method = config.method?.toUpperCase() || 'GET';
      const path = config.url?.replace(API_BASE_URL, '') || '';
      
      const payload = {
        method,
        path,
        timestamp,
        data: requestData
      };
      
      try {
        const signature = await generateHMAC(payload, HMAC_SECRET);
        config.headers['X-Auth-Timestamp'] = timestamp;
        config.headers['X-Auth-Signature'] = signature;
      } catch (error) {
        console.error('HMAC generation failed', error);
      }
    }
    
    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration (401 errors)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/refresh-token`, {
          withCredentials: true,
          timeout: REQUEST_TIMEOUT
        });
        
        if (response.data.accessToken) {
          store.dispatch(updateToken(response.data.accessToken));
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        store.dispatch(logoutUser());
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Enhanced request method
api.secureRequest = async (config) => {
  let attempt = 0;
  
  while (attempt <= MAX_RETRIES) {
    try {
      return await api(config);
    } catch (error) {
      if (attempt >= MAX_RETRIES || !isRetryableError(error)) {
        throw error;
      }
      
      const delay = 2 ** attempt * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }
};

function isRetryableError(error) {
  return (
    !error.response ||
    error.response.status >= 500 || 
    error.response.status === 429 || 
    error.code === 'ECONNABORTED'
  );
}

export default api;