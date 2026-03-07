const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
    createdAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate bookmarks
bookmarkSchema.index({ userId: 1, noteId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
