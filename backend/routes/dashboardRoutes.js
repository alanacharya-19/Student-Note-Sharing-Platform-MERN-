const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAdminStats,
  getPendingNotes
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// User dashboard
router.get('/stats', protect, getDashboardStats);

// Admin dashboard
router.get('/admin', protect, adminOnly, getAdminStats);
router.get('/pending-notes', protect, adminOnly, getPendingNotes);

module.exports = router;
