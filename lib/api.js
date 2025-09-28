import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (project) => api.post('/projects', project),
  update: (id, project) => api.put(`/projects/${id}`, project),
  delete: (id) => api.delete(`/projects/${id}`)
};

export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  getByProject: (projectId) => api.get(`/tasks?projectId=${projectId}`),
  create: (task) => api.post('/tasks', task),
  update: (id, task) => api.put(`/tasks/${id}`, task),
  delete: (id) => api.delete(`/tasks/${id}`)
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`)
};