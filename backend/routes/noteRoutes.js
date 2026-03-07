const express = require('express');
const router = express.Router();
const {
  uploadNote,
  getNotes,
  getNoteById,
  deleteNote,
  likeNote,
  downloadNote,
  getTopDownloaded,
  getRecentNotes,
  getNotesByUser,
  getMyNotes,
  updateApprovalStatus
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { uploadNote: noteUpload } = require('../middleware/upload');
const { noteUploadValidation, noteIdValidation } = require('../middleware/validation');

// Public routes
router.get('/', getNotes);
router.get('/top/downloaded', getTopDownloaded);
router.get('/recent', getRecentNotes);
router.get('/user/:userId', getNotesByUser);
router.get('/:id', getNoteById);
router.get('/:id/download', downloadNote);

// Protected routes
router.post('/upload', protect, noteUpload.single('file'), noteUploadValidation, uploadNote);
router.get('/my/notes', protect, getMyNotes);
router.delete('/:id', protect, noteIdValidation, deleteNote);
router.post('/:id/like', protect, noteIdValidation, likeNote);

// Admin routes
router.put('/:id/approve', protect, adminOnly, noteIdValidation, updateApprovalStatus);

module.exports = router;