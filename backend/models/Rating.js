const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate ratings from same user
ratingSchema.index({ userId: 1, noteId: 1 }, { unique: true });
ratingSchema.index({ noteId: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
