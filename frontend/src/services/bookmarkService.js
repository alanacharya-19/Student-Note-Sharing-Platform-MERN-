import API from './api';

const bookmarkService = {
  // Get user's bookmarks
  getBookmarks: async (params = {}) => {
    const response = await API.get('/bookmarks', { params });
    return response.data;
  },

  // Add bookmark
  addBookmark: async (noteId) => {
    const response = await API.post(`/bookmarks/${noteId}`);
    return response.data;
  },

  // Remove bookmark
  removeBookmark: async (noteId) => {
    const response = await API.delete(`/bookmarks/${noteId}`);
    return response.data;
  },

  // Check if note is bookmarked
  checkBookmark: async (noteId) => {
    const response = await API.get(`/bookmarks/check/${noteId}`);
    return response.data;
  },

  // Toggle bookmark (add if not exists, remove if exists)
  toggleBookmark: async (noteId, isBookmarked) => {
    if (isBookmarked) {
      return await bookmarkService.removeBookmark(noteId);
    } else {
      return await bookmarkService.addBookmark(noteId);
    }
  }
};

export default bookmarkService;
