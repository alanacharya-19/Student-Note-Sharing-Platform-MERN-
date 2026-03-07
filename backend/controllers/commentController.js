const Comment = require('../models/Comment');
const Note = require('../models/Note');
const { MESSAGES } = require('../utils/constants');
const { timeAgo } = require('../utils/helpers');

// @desc    Create new comment
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const { noteId, text } = req.body;

    // Check if note exists
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    const comment = await Comment.create({
      userId: req.user._id,
      noteId,
      text
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'name avatar');

    res.status(201).json({
      success: true,
      message: MESSAGES.COMMENT.ADDED,
      data: {
        ...populatedComment.toObject(),
        timeAgo: timeAgo(populatedComment.createdAt)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get comments for a note
// @route   GET /api/comments/:noteId
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ noteId: req.params.noteId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });

    const commentsWithMeta = comments.map(comment => ({
      ...comment.toObject(),
      timeAgo: timeAgo(comment.createdAt)
    }));

    res.json({
      success: true,
      data: commentsWithMeta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    // Comment is already attached by adminOrOwner middleware
    const comment = req.resource;
    
    await Comment.findByIdAndDelete(comment._id);

    res.json({
      success: true,
      message: MESSAGES.COMMENT.DELETED
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};