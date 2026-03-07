const Rating = require('../models/Rating');
const Note = require('../models/Note');
const { MESSAGES } = require('../utils/constants');

// @desc    Get ratings for a note
// @route   GET /api/ratings/:noteId
// @access  Public
exports.getRatings = async (req, res) => {
  try {
    const { noteId } = req.params;

    const ratings = await Rating.find({ noteId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(rating => {
      distribution[rating.rating]++;
    });

    res.json({
      success: true,
      data: {
        ratings,
        distribution,
        total: ratings.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add or update rating
// @route   POST /api/ratings
// @access  Private
exports.addOrUpdateRating = async (req, res) => {
  try {
    const { noteId, rating } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.RATING.INVALID
      });
    }

    // Check if note exists
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if user already rated
    const existingRating = await Rating.findOne({
      userId: req.user._id,
      noteId
    });

    let message;
    
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.updatedAt = Date.now();
      await existingRating.save();
      message = MESSAGES.RATING.UPDATED;
    } else {
      // Create new rating
      await Rating.create({
        userId: req.user._id,
        noteId,
        rating
      });
      note.totalRatings += 1;
      message = MESSAGES.RATING.ADDED;
    }

    // Recalculate average rating
    const allRatings = await Rating.find({ noteId });
    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    
    note.averageRating = Math.round(averageRating * 10) / 10;
    await note.save();

    res.status(201).json({
      success: true,
      message,
      data: {
        averageRating: note.averageRating,
        totalRatings: note.totalRatings,
        userRating: rating
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete rating
// @route   DELETE /api/ratings/:noteId
// @access  Private
exports.deleteRating = async (req, res) => {
  try {
    const { noteId } = req.params;

    const rating = await Rating.findOneAndDelete({
      userId: req.user._id,
      noteId
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Recalculate average rating
    const note = await Note.findById(noteId);
    const allRatings = await Rating.find({ noteId });
    
    if (allRatings.length > 0) {
      const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      note.averageRating = Math.round(averageRating * 10) / 10;
    } else {
      note.averageRating = 0;
    }
    
    note.totalRatings = allRatings.length;
    await note.save();

    res.json({
      success: true,
      message: 'Rating deleted successfully',
      data: {
        averageRating: note.averageRating,
        totalRatings: note.totalRatings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's rating for a note
// @route   GET /api/ratings/user/:noteId
// @access  Private
exports.getUserRating = async (req, res) => {
  try {
    const { noteId } = req.params;

    const rating = await Rating.findOne({
      userId: req.user._id,
      noteId
    });

    res.json({
      success: true,
      data: {
        rating: rating?.rating || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
