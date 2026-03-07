import API from './api';

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await API.get('/auth/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await API.put('/auth/profile', profileData);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (formData) => {
    const response = await API.post('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await API.put('/auth/password', passwordData);
    return response.data;
  },

  // Get all users (admin only)
  getAllUsers: async (params = {}) => {
    const response = await API.get('/auth/users', { params });
    return response.data;
  },

  // Get user by ID (public)
  getUserById: async (userId) => {
    const response = await API.get(`/auth/public-profile/${userId}`);
    return response.data;
  },

  // Update user status (admin only)
  updateUserStatus: async (userId, isActive) => {
    const response = await API.put(`/auth/users/${userId}/status`, { isActive });
    return response.data;
  }
};

export default authService;
