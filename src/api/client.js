import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong. Please try again.';
    const error = new Error(message);
    error.status = err.response?.status;
    error.code = err.response?.data?.code;
    error.data = err.response?.data;
    return Promise.reject(error);
  },
);
