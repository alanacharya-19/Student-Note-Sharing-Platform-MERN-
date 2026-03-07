const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    subject: { type: String, required: true, trim: true },
    semester: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    fileName: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Indexes for faster queries
noteSchema.index({ subject: 1 });
noteSchema.index({ semester: 1 });
noteSchema.index({ uploadedBy: 1 });
noteSchema.index({ createdAt: -1 });
noteSchema.index({ downloads: -1 });
noteSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Note', noteSchema);