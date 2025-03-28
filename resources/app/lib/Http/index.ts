// THIS WILL BE THE HTTP LIB USING AXIOS WHERE IT PASSES EVERYTHING TO AUTHENTICATE THE FRONTEND AND BACKEND 
// No need to worry about this file, it's just a simple HTTP client using Axios with CSRF token handling and progress bar

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  minimum: 0.1,
  easing: 'ease',
  speed: 500
});

// Track number of active requests
let activeRequests = 0;

const startProgress = () => {
  activeRequests++;
  NProgress.start();
};

const stopProgress = () => {
  activeRequests--;
  if (activeRequests <= 0) {
    activeRequests = 0;
    NProgress.done();
  }
};

// Create axios instance with default config
const http = axios.create({
  baseURL: '/', 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true // Important for cookies/session handling
});

// Request interceptor to add CSRF token
http.interceptors.request.use((config) => {
  // Start progress bar
  startProgress();
  
  // Add CSRF token if available in window.ssr
  if (window.ssr && window.ssr.props && window.ssr.props.csrfToken) {
    config.headers['X-CSRF-TOKEN'] = window.ssr.props.csrfToken;
  }
  return config;
});

// Response interceptor for error handling
http.interceptors.response.use(
  (response) => {
    stopProgress();
    return response;
  },
  (error) => {
    stopProgress();
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      window.location.href = '/auth/login';
      return Promise.reject(error);
    }
    
    // Handle validation errors or pass through other errors
    return Promise.reject(error);
  }
);

// Utility types
type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
type HttpOptions = Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>;

// Generic HTTP client with typed responses
class HttpClient {
  // GET request
  static async get<T = any>(url: string, options?: HttpOptions): Promise<T> {
    const response = await http.get<T>(url, options);
    return response.data;
  }

  // POST request
  static async post<T = any>(url: string, data?: any, options?: HttpOptions): Promise<T> {
    const response = await http.post<T>(url, data, options);
    return response.data;
  }

  // PUT request
  static async put<T = any>(url: string, data?: any, options?: HttpOptions): Promise<T> {
    const response = await http.put<T>(url, data, options);
    return response.data;
  }

  // PATCH request
  static async patch<T = any>(url: string, data?: any, options?: HttpOptions): Promise<T> {
    const response = await http.patch<T>(url, data, options);
    return response.data;
  }

  // DELETE request
  static async delete<T = any>(url: string, options?: HttpOptions): Promise<T> {
    const response = await http.delete<T>(url, options);
    return response.data;
  }

  // File upload with progress tracking
  static async upload<T = any>(
    url: string, 
    formData: FormData,
    onProgress?: (percentage: number) => void
  ): Promise<T> {
    const response = await http.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      }
    });
    return response.data;
  }
}

export default HttpClient;