import API from './api';

const dashboardService = {
  // Get user dashboard stats
  getDashboardStats: async () => {
    const response = await API.get('/dashboard/stats');
    return response.data;
  },

  // Get admin dashboard stats
  getAdminStats: async () => {
    const response = await API.get('/dashboard/admin');
    return response.data;
  },

  // Get pending notes (admin only)
  getPendingNotes: async (params = {}) => {
    const response = await API.get('/dashboard/pending-notes', { params });
    return response.data;
  }
};

export default dashboardService;
