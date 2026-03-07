import API from './api';

const ratingService = {
  // Get ratings for a note
  getRatings: async (noteId) => {
    const response = await API.get(`/ratings/${noteId}`);
    return response.data;
  },

  // Add or update rating
  addOrUpdateRating: async (noteId, rating) => {
    const response = await API.post('/ratings', { noteId, rating });
    return response.data;
  },

  // Delete rating
  deleteRating: async (noteId) => {
    const response = await API.delete(`/ratings/${noteId}`);
    return response.data;
  },

  // Get user's rating for a note
  getUserRating: async (noteId) => {
    const response = await API.get(`/ratings/user/${noteId}`);
    return response.data;
  }
};

export default ratingService;
