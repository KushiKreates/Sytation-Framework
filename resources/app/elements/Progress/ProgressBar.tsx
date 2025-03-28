import { useEffect } from 'react';
import axios from 'axios';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  minimum: 0.1,
  easing: 'ease',
  speed: 500
});

const ProgressBar = () => {
  useEffect(() => {
    // Request interceptor
    const requestInterceptor = axios.interceptors.request.use((config) => {
      NProgress.start();
      return config;
    });

    // Response interceptor
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        NProgress.done();
        return response;
      },
      (error) => {
        NProgress.done();
        return Promise.reject(error);
      }
    );

    // Clean up on component unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return null;
};

export default ProgressBar;