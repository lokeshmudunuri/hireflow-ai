import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hireflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking auth or on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('hireflow_token');
        localStorage.removeItem('hireflow_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email })
};

// Dashboard Services
export const dashboardApi = {
  getStats: () => api.get('/dashboard')
};

// Jobs Services
export const jobsApi = {
  getJobs: () => api.get('/jobs'),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  closeJob: (id) => api.patch(`/jobs/${id}/close`),
  reopenJob: (id) => api.patch(`/jobs/${id}/reopen`)
};

// Applications Services
export const applicationsApi = {
  getApplications: (params) => api.get('/applications', { params }),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  validateApplication: (id, payload) => api.post(`/applications/${id}/validate`, payload),
  recalculateScore: (id) => api.post(`/applications/${id}/recalculate-score`),
  updateStatus: (id, status, reason) => api.patch(`/applications/${id}/status`, { status, reason }),
  bulkUpdateStatus: (applicationIds, targetStatus, reason) =>
    api.post('/applications/bulk-status', { applicationIds, targetStatus, reason }),
  makeFinalDecision: (applicationId, decision, comments) =>
    api.post(`/applications/${applicationId}/decision`, { decision, comments })
};

// Candidates Services
export const candidatesApi = {
  getCandidates: (params) => api.get('/candidates', { params }),
  getCandidateById: (id) => api.get(`/candidates/${id}`),
  createCandidate: (data) => api.post('/candidates', data),
  addNote: (candidateId, note, applicationId) =>
    api.post(`/candidates/${candidateId}/notes`, { note, applicationId })
};

// Interviews Services
export const interviewsApi = {
  getInterviews: (params) => api.get('/interviews', { params }),
  getInterviewById: (id) => api.get(`/interviews/${id}`),
  scheduleInterview: (interviewData) => api.post('/interviews', interviewData),
  updateStatus: (id, status) => api.patch(`/interviews/${id}/status`, { status })
};

// Evaluations Services
export const evaluationsApi = {
  submitEvaluation: (evaluationData) => api.post('/evaluations', evaluationData),
  getByInterviewId: (interviewId) => api.get(`/evaluations/interview/${interviewId}`)
};

// Users Services
export const usersApi = {
  getUsers: () => api.get('/users'),
  getInterviewers: () => api.get('/users/interviewers'),
  createUser: (userData) => api.post('/users', userData),
  toggleStatus: (id) => api.patch(`/users/${id}/status`),
  changeRole: (id, role) => api.patch(`/users/${id}/role`, { role })
};

// Notifications Services
export const notificationsApi = {
  getNotifications: () => api.get('/notifications'),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`)
};

export default api;
