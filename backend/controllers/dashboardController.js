const User = require('../models/User');
const Note = require('../models/Note');
const Comment = require('../models/Comment');
const Bookmark = require('../models/Bookmark');
const Rating = require('../models/Rating');

// @desc    Get dashboard stats for logged in user
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's notes stats
    const notesStats = await Note.aggregate([
      { $match: { uploadedBy: userId } },
      {
        $group: {
          _id: null,
          totalNotes: { $sum: 1 },
          totalDownloads: { $sum: '$downloads' },
          totalLikes: { $sum: { $size: '$likes' } },
          totalBookmarks: { $sum: '$bookmarks' }
        }
      }
    ]);

    // Get user's bookmarks count
    const bookmarksCount = await Bookmark.countDocuments({ userId });

    // Get user's comments count
    const commentsCount = await Comment.countDocuments({ userId });

    // Get recent activity (last 5 notes)
    const recentNotes = await Note.find({ uploadedBy: userId })
      .select('title subject downloads createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get most downloaded notes
    const topNotes = await Note.find({ uploadedBy: userId })
      .select('title subject downloads likes')
      .sort({ downloads: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalNotes: notesStats[0]?.totalNotes || 0,
          totalDownloads: notesStats[0]?.totalDownloads || 0,
          totalLikes: notesStats[0]?.totalLikes || 0,
          totalBookmarks: notesStats[0]?.totalBookmarks || 0,
          bookmarksCount,
          commentsCount
        },
        recentNotes,
        topNotes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    // Get total counts
    const [
      totalUsers,
      totalNotes,
      totalComments,
      totalBookmarks,
      totalRatings
    ] = await Promise.all([
      User.countDocuments(),
      Note.countDocuments(),
      Comment.countDocuments(),
      Bookmark.countDocuments(),
      Rating.countDocuments()
    ]);

    // Get pending approval notes count
    const pendingNotes = await Note.countDocuments({ isApproved: false });

    // Get total downloads across all notes
    const downloadsStats = await Note.aggregate([
      {
        $group: {
          _id: null,
          totalDownloads: { $sum: '$downloads' }
        }
      }
    ]);

    // Get user growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get notes by subject
    const notesBySubject = await Note.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get top contributors
    const topContributors = await Note.aggregate([
      {
        $group: {
          _id: '$uploadedBy',
          notesCount: { $sum: 1 },
          totalDownloads: { $sum: '$downloads' }
        }
      },
      { $sort: { notesCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          notesCount: 1,
          totalDownloads: 1,
          userName: { $arrayElemAt: ['$user.name', 0] },
          userEmail: { $arrayElemAt: ['$user.email', 0] }
        }
      }
    ]);

    // Get recent activity
    const recentActivity = await Promise.all([
      Note.find()
        .populate('uploadedBy', 'name')
        .select('title uploadedBy createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
      User.find()
        .select('name createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalNotes,
          totalComments,
          totalBookmarks,
          totalRatings,
          pendingNotes,
          totalDownloads: downloadsStats[0]?.totalDownloads || 0
        },
        userGrowth,
        notesBySubject,
        topContributors,
        recentNotes: recentActivity[0],
        recentUsers: recentActivity[1]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get pending notes (Admin only)
// @route   GET /api/dashboard/pending-notes
// @access  Private/Admin
exports.getPendingNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      Note.find({ isApproved: false })
        .populate('uploadedBy', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Note.countDocuments({ isApproved: false })
    ]);

    res.json({
      success: true,
      data: notes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
