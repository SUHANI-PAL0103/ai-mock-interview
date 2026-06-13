import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const authService = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  verifyLoginOTP: (payload) => api.post('/auth/verify-login-otp', payload),
  profile: () => api.get('/auth/me'),
  updateProfile: (payload) => api.put('/auth/profile', payload),
  sendOTP: (email) => api.post('/auth/send-otp', { email }),
  verifyOTP: (payload) => api.post('/auth/verify-otp', payload),
}

export const interviewService = {
  create: (payload) => api.post('/interviews', payload),
  list: (params) => api.get('/interviews', { params }),
  get: (id) => api.get(`/interviews/${id}`),
  submitAnswer: (id, payload) => api.post(`/interviews/${id}/submit-answer`, payload),
  submit: (id) => api.post(`/interviews/${id}/submit`),
  delete: (id) => api.delete(`/interviews/${id}`),
  stats: () => api.get('/interviews/stats'),
}

export const resumeService = {
  analyze: (formData) =>
    api.post('/resume/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export default api