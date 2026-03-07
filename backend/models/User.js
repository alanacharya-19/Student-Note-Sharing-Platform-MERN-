const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    college: { type: String, trim: true, maxlength: 200 },
    faculty: { type: String, trim: true, maxlength: 100 },
    program: { type: String, trim: true, maxlength: 100 },
    semester: { type: String, trim: true, maxlength: 50 },
    avatar: { type: String, default: '' },
    bio: { type: String, maxlength: 500, default: '' },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Index for faster queries (email index is already created by unique: true)
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);