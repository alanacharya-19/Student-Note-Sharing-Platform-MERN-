import API from './api';

const commentService = {
  // Get comments for a note
  getComments: async (noteId) => {
    const response = await API.get(`/comments/${noteId}`);
    return response.data;
  },

  // Add comment
  addComment: async (noteId, text) => {
    const response = await API.post('/comments', { noteId, text });
    return response.data;
  },

  // Delete comment
  deleteComment: async (commentId) => {
    const response = await API.delete(`/comments/${commentId}`);
    return response.data;
  }
};

export default commentService;
