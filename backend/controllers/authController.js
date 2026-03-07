const User = require('../models/User');
const Note = require('../models/Note');
const Bookmark = require('../models/Bookmark');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MESSAGES, JWT_CONFIG } = require('../utils/constants');
const { sanitizeUser, createPagination } = require('../utils/helpers');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: JWT_CONFIG.EXPIRES_IN });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, college, faculty, program, semester, role } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.AUTH.USER_EXISTS
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (only allow 'student' role from registration, admin must be set manually)
    const userRole = role === 'admin' ? 'student' : role || 'student';
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      college,
      faculty,
      program,
      semester,
      role: userRole
    });

    res.status(201).json({
      success: true,
      message: MESSAGES.AUTH.REGISTER_SUCCESS,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        faculty: user.faculty,
        program: user.program,
        semester: user.semester,
        avatar: user.avatar,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: MESSAGES.AUTH.INVALID_CREDENTIALS
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: MESSAGES.AUTH.INVALID_CREDENTIALS
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.'
      });
    }

    res.json({
      success: true,
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        faculty: user.faculty,
        program: user.program,
        semester: user.semester,
        avatar: user.avatar,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.AUTH.USER_NOT_FOUND
      });
    }

    // Get user's stats
    const notesCount = await Note.countDocuments({ uploadedBy: user._id });
    const bookmarksCount = await Bookmark.countDocuments({ userId: user._id });
    const totalDownloads = await Note.aggregate([
      { $match: { uploadedBy: user._id } },
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);

    res.json({
      success: true,
      data: {
        ...sanitizeUser(user),
        stats: {
          notesUploaded: notesCount,
          bookmarksCount,
          totalDownloads: totalDownloads[0]?.total || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, college, faculty, program, semester, bio } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, college, faculty, program, semester, bio },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.AUTH.USER_NOT_FOUND
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload avatar
// @route   POST /api/auth/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatar: avatarUrl }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Build query
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: createPagination(page, limit, total)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/auth/public-profile/:id
// @access  Public
exports.getUserById = async (req, res) => {
  try {
    if (!req.params.id || req.params.id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's notes
    const notes = await Note.find({ uploadedBy: user._id })
      .select('title subject downloads likes fileType fileSize createdAt description')
      .sort({ createdAt: -1 });

    // Add uploadedBy info to each note for the NoteCard component
    const notesWithUploader = notes.map(note => ({
      ...note.toObject(),
      uploadedBy: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar
      }
    }));

    res.json({
      success: true,
      data: {
        ...sanitizeUser(user),
        notes: notesWithUploader
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user status (Admin only)
// @route   PUT /api/auth/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.AUTH.USER_NOT_FOUND
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};