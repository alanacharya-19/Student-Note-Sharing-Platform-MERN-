const express = require('express');
const router = express.Router();
const {
  getBookmarks,
  addBookmark,
  removeBookmark,
  checkBookmark
} = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

// All bookmark routes are protected
router.get('/', protect, getBookmarks);
router.get('/check/:noteId', protect, checkBookmark);
router.post('/:noteId', protect, addBookmark);
router.delete('/:noteId', protect, removeBookmark);

module.exports = router;
