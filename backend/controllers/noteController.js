const Note = require('../models/Note');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');
const Bookmark = require('../models/Bookmark');
const path = require('path');
const fs = require('fs');
const { MESSAGES, PAGINATION, SORT_OPTIONS } = require('../utils/constants');
const { createPagination, buildSearchQuery, timeAgo } = require('../utils/helpers');
const { deleteFile, getFileType, formatFileSize } = require('../middleware/upload');

// @desc    Upload new note
// @route   POST /api/notes/upload
// @access  Private
exports.uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title, description, subject, semester } = req.body;
    const fileType = getFileType(req.file.mimetype);

    const note = await Note.create({
      title,
      description,
      subject,
      semester,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType,
      fileSize: req.file.size,
      uploadedBy: req.user._id
    });

    const populatedNote = await Note.findById(note._id)
      .populate('uploadedBy', 'name avatar');

    res.status(201).json({
      success: true,
      message: MESSAGES.NOTE.UPLOAD_SUCCESS,
      data: populatedNote
    });
  } catch (error) {
    // Clean up uploaded file if note creation fails
    if (req.file) {
      await deleteFile(req.file.filename);
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all notes with pagination, search, and filters
// @route   GET /api/notes
// @access  Public
exports.getNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;
    const { search, subject, semester, sort } = req.query;

    // Build query
    let query = { isApproved: true };

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (subject) query.subject = subject;
    if (semester) query.semester = semester;

    // Sort options
    let sortOption = {};
    switch (sort) {
      case SORT_OPTIONS.OLDEST:
        sortOption = { createdAt: 1 };
        break;
      case SORT_OPTIONS.MOST_DOWNLOADED:
        sortOption = { downloads: -1 };
        break;
      case SORT_OPTIONS.MOST_LIKED:
        sortOption = { likes: -1 };
        break;
      case SORT_OPTIONS.HIGHEST_RATED:
        sortOption = { averageRating: -1 };
        break;
      case SORT_OPTIONS.NEWEST:
      default:
        sortOption = { createdAt: -1 };
    }

    // Execute query with pagination
    const [notes, total] = await Promise.all([
      Note.find(query)
        .populate('uploadedBy', 'name avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Note.countDocuments(query)
    ]);

    // Add time ago to each note
    const notesWithMeta = notes.map(note => ({
      ...note,
      timeAgo: timeAgo(note.createdAt),
      likesCount: note.likes?.length || 0
    }));

    res.json({
      success: true,
      data: notesWithMeta,
      pagination: createPagination(page, limit, total)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single note by ID
// @route   GET /api/notes/:id
// @access  Public
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('uploadedBy', 'name email college semester avatar bio createdAt');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOTE.NOT_FOUND
      });
    }

    // Increment view count
    note.viewCount += 1;
    await note.save();

    // Check if user has bookmarked this note
    let isBookmarked = false;
    let userRating = null;
    
    if (req.user) {
      const bookmark = await Bookmark.findOne({
        userId: req.user._id,
        noteId: note._id
      });
      isBookmarked = !!bookmark;

      const rating = await Rating.findOne({
        userId: req.user._id,
        noteId: note._id
      });
      userRating = rating?.rating || null;
    }

    res.json({
      success: true,
      data: {
        ...note.toObject(),
        timeAgo: timeAgo(note.createdAt),
        likesCount: note.likes?.length || 0,
        isBookmarked,
        userRating,
        fileSizeFormatted: formatFileSize(note.fileSize)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOTE.NOT_FOUND
      });
    }

    // Check ownership or admin
    const isOwner = note.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this note'
      });
    }

    // Delete file from disk
    const filename = path.basename(note.fileUrl);
    await deleteFile(filename);

    // Delete associated data
    await Promise.all([
      Comment.deleteMany({ noteId: note._id }),
      Bookmark.deleteMany({ noteId: note._id }),
      Rating.deleteMany({ noteId: note._id }),
      Note.findByIdAndDelete(req.params.id)
    ]);

    res.json({
      success: true,
      message: MESSAGES.NOTE.DELETE_SUCCESS
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle like on note
// @route   POST /api/notes/:id/like
// @access  Private
exports.likeNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOTE.NOT_FOUND
      });
    }

    const isLiked = note.likes.includes(req.user._id);
    
    if (isLiked) {
      note.likes = note.likes.filter(id => id.toString() !== req.user._id.toString());
      await note.save();
      
      res.json({
        success: true,
        message: MESSAGES.NOTE.LIKE_REMOVED,
        data: { likes: note.likes.length, isLiked: false }
      });
    } else {
      note.likes.push(req.user._id);
      await note.save();
      
      res.json({
        success: true,
        message: MESSAGES.NOTE.LIKE_ADDED,
        data: { likes: note.likes.length, isLiked: true }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Download note
// @route   GET /api/notes/:id/download
// @access  Public
exports.downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOTE.NOT_FOUND
      });
    }

    // Increment download count
    note.downloads += 1;
    await note.save();

    const filePath = path.join(__dirname, '..', note.fileUrl);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.download(filePath, note.fileName);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get top downloaded notes
// @route   GET /api/notes/top/downloaded
// @access  Public
exports.getTopDownloaded = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const notes = await Note.find({ isApproved: true })
      .populate('uploadedBy', 'name avatar')
      .sort({ downloads: -1 })
      .limit(limit)
      .lean();

    const notesWithMeta = notes.map(note => ({
      ...note,
      timeAgo: timeAgo(note.createdAt),
      likesCount: note.likes?.length || 0
    }));

    res.json({
      success: true,
      data: notesWithMeta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get recently uploaded notes
// @route   GET /api/notes/recent
// @access  Public
exports.getRecentNotes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const notes = await Note.find({ isApproved: true })
      .populate('uploadedBy', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const notesWithMeta = notes.map(note => ({
      ...note,
      timeAgo: timeAgo(note.createdAt),
      likesCount: note.likes?.length || 0
    }));

    res.json({
      success: true,
      data: notesWithMeta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get notes by user
// @route   GET /api/notes/user/:userId
// @access  Public
exports.getNotesByUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      Note.find({ uploadedBy: req.params.userId, isApproved: true })
        .populate('uploadedBy', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Note.countDocuments({ uploadedBy: req.params.userId, isApproved: true })
    ]);

    const notesWithMeta = notes.map(note => ({
      ...note,
      timeAgo: timeAgo(note.createdAt),
      likesCount: note.likes?.length || 0
    }));

    res.json({
      success: true,
      data: notesWithMeta,
      pagination: createPagination(page, limit, total)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my notes (for logged in user)
// @route   GET /api/notes/my/notes
// @access  Private
exports.getMyNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      Note.find({ uploadedBy: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Note.countDocuments({ uploadedBy: req.user._id })
    ]);

    const notesWithMeta = notes.map(note => ({
      ...note,
      timeAgo: timeAgo(note.createdAt),
      likesCount: note.likes?.length || 0
    }));

    res.json({
      success: true,
      data: notesWithMeta,
      pagination: createPagination(page, limit, total)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update note approval status (Admin only)
// @route   PUT /api/notes/:id/approve
// @access  Private/Admin
exports.updateApprovalStatus = async (req, res) => {
  try {
    const { isApproved } = req.body;
    
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    ).populate('uploadedBy', 'name avatar');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOTE.NOT_FOUND
      });
    }

    res.json({
      success: true,
      message: `Note ${isApproved ? 'approved' : 'unapproved'} successfully`,
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};