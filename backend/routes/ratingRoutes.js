const express = require('express');
const router = express.Router();
const {
  getRatings,
  addOrUpdateRating,
  deleteRating,
  getUserRating
} = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');
const { ratingValidation } = require('../middleware/validation');

// Public routes
router.get('/:noteId', getRatings);

// Protected routes
router.get('/user/:noteId', protect, getUserRating);
router.post('/', protect, ratingValidation, addOrUpdateRating);
router.delete('/:noteId', protect, deleteRating);

module.exports = router;
