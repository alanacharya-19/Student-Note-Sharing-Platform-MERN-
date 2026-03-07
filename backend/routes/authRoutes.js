const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserStatus
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { uploadAvatar: avatarUpload } = require('../middleware/upload');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation
} = require('../middleware/validation');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/public-profile/:id', getUserById); // Public profile endpoint

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.post('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);
router.put('/password', protect, changePassword);

// Admin routes
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, adminOnly, getUserById);
router.put('/users/:id/status', protect, adminOnly, updateUserStatus);

module.exports = router;