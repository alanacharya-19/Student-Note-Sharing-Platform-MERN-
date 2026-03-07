const express = require('express');
const router = express.Router();
const { createComment, getComments, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { adminOrOwner } = require('../middleware/admin');
const { commentValidation } = require('../middleware/validation');
const Comment = require('../models/Comment');

// Public routes
router.get('/:noteId', getComments);

// Protected routes
router.post('/', protect, commentValidation, createComment);
router.delete('/:id', protect, adminOrOwner(Comment), deleteComment);

module.exports = router;