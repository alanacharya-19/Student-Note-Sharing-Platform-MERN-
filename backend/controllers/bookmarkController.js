const Bookmark = require('../models/Bookmark');
const Note = require('../models/Note');
const { MESSAGES, PAGINATION } = require('../utils/constants');
const { createPagination, timeAgo } = require('../utils/helpers');

// @desc    Get user's bookmarks
// @route   GET /api/bookmarks
// @access  Private
exports.getBookmarks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      Bookmark.find({ userId: req.user._id })
        .populate({
          path: 'noteId',
          populate: {
            path: 'uploadedBy',
            select: 'name avatar'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Bookmark.countDocuments({ userId: req.user._id })
    ]);

    // Filter out bookmarks where note might have been deleted
    const validBookmarks = bookmarks
      .filter(bookmark => bookmark.noteId)
      .map(bookmark => ({
        _id: bookmark._id,
        note: {
          ...bookmark.noteId.toObject(),
          timeAgo: timeAgo(bookmark.noteId.createdAt),
          likesCount: bookmark.noteId.likes?.length || 0
        },
        createdAt: bookmark.createdAt
      }));

    res.json({
      success: true,
      data: validBookmarks,
      pagination: createPagination(page, limit, total)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add bookmark
// @route   POST /api/bookmarks/:noteId
// @access  Private
exports.addBookmark = async (req, res) => {
  try {
    const { noteId } = req.params;

    // Check if note exists
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      userId: req.user._id,
      noteId
    });

    if (existingBookmark) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.BOOKMARK.ALREADY_EXISTS
      });
    }

    // Create bookmark
    await Bookmark.create({
      userId: req.user._id,
      noteId
    });

    // Update note bookmark count
    note.bookmarks += 1;
    await note.save();

    res.status(201).json({
      success: true,
      message: MESSAGES.BOOKMARK.ADDED
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove bookmark
// @route   DELETE /api/bookmarks/:noteId
// @access  Private
exports.removeBookmark = async (req, res) => {
  try {
    const { noteId } = req.params;

    const bookmark = await Bookmark.findOneAndDelete({
      userId: req.user._id,
      noteId
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    // Update note bookmark count
    const note = await Note.findById(noteId);
    if (note) {
      note.bookmarks = Math.max(0, note.bookmarks - 1);
      await note.save();
    }

    res.json({
      success: true,
      message: MESSAGES.BOOKMARK.REMOVED
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check if note is bookmarked
// @route   GET /api/bookmarks/check/:noteId
// @access  Private
exports.checkBookmark = async (req, res) => {
  try {
    const { noteId } = req.params;

    const bookmark = await Bookmark.findOne({
      userId: req.user._id,
      noteId
    });

    res.json({
      success: true,
      data: {
        isBookmarked: !!bookmark
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
