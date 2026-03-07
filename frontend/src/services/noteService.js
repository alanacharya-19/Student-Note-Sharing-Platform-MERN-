import API from './api';

const noteService = {
  // Get all notes with pagination, search, and filters
  getNotes: async (params = {}) => {
    const response = await API.get('/notes', { params });
    return response.data;
  },

  // Get single note
  getNoteById: async (noteId) => {
    const response = await API.get(`/notes/${noteId}`);
    return response.data;
  },

  // Upload new note
  uploadNote: async (formData) => {
    const response = await API.post('/notes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete note
  deleteNote: async (noteId) => {
    const response = await API.delete(`/notes/${noteId}`);
    return response.data;
  },

  // Like note
  likeNote: async (noteId) => {
    const response = await API.post(`/notes/${noteId}/like`);
    return response.data;
  },

  // Bookmark note
  bookmarkNote: async (noteId) => {
    const response = await API.post(`/bookmarks/${noteId}`);
    return response.data;
  },

  // Remove bookmark
  removeBookmark: async (noteId) => {
    const response = await API.delete(`/bookmarks/${noteId}`);
    return response.data;
  },

  // Download note
  downloadNote: async (noteId) => {
    const response = await API.get(`/notes/${noteId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get top downloaded notes
  getTopDownloaded: async (limit = 10) => {
    const response = await API.get('/notes/top/downloaded', { params: { limit } });
    return response.data;
  },

  // Get recent notes
  getRecentNotes: async (limit = 10) => {
    const response = await API.get('/notes/recent', { params: { limit } });
    return response.data;
  },

  // Get notes by user
  getNotesByUser: async (userId, params = {}) => {
    const response = await API.get(`/notes/user/${userId}`, { params });
    return response.data;
  },

  // Get my notes
  getMyNotes: async (params = {}) => {
    const response = await API.get('/notes/my/notes', { params });
    return response.data;
  },

  // Update note approval status (admin only)
  updateApprovalStatus: async (noteId, isApproved) => {
    const response = await API.put(`/notes/${noteId}/approve`, { isApproved });
    return response.data;
  }
};

export default noteService;
