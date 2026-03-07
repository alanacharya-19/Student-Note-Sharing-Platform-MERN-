// Application Constants

// Subjects list
const SUBJECTS = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Engineering',
    'Medicine',
    'Law',
    'Business',
    'Economics',
    'History',
    'Geography',
    'Literature',
    'Philosophy',
    'Psychology',
    'Sociology',
    'Political Science',
    'Art',
    'Music',
    'Languages',
    'Other'
];

// Semesters list
const SEMESTERS = [
    '1st Semester',
    '2nd Semester',
    '3rd Semester',
    '4th Semester',
    '5th Semester',
    '6th Semester',
    '7th Semester',
    '8th Semester',
    '9th Semester',
    '10th Semester',
    '11th Semester',
    '12th Semester'
];

// File type icons mapping
const FILE_TYPE_ICONS = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    ppt: '📊',
    pptx: '📊',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    txt: '📃',
    unknown: '📎'
};

// File type colors for UI
const FILE_TYPE_COLORS = {
    pdf: 'red',
    doc: 'blue',
    docx: 'blue',
    ppt: 'orange',
    pptx: 'orange',
    jpg: 'green',
    jpeg: 'green',
    png: 'green',
    gif: 'green',
    txt: 'gray',
    unknown: 'gray'
};

// Pagination defaults
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 50
};

// Sort options
const SORT_OPTIONS = {
    NEWEST: 'newest',
    OLDEST: 'oldest',
    MOST_DOWNLOADED: 'downloads',
    MOST_LIKED: 'likes',
    HIGHEST_RATED: 'rating'
};

// JWT Configuration
const JWT_CONFIG = {
    EXPIRES_IN: '30d',
    COOKIE_EXPIRES_IN: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
};

// User roles
const USER_ROLES = {
    STUDENT: 'student',
    ADMIN: 'admin'
};

// Response messages
const MESSAGES = {
    AUTH: {
        REGISTER_SUCCESS: 'User registered successfully',
        LOGIN_SUCCESS: 'Login successful',
        LOGOUT_SUCCESS: 'Logout successful',
        INVALID_CREDENTIALS: 'Invalid email or password',
        USER_EXISTS: 'User already exists with this email',
        USER_NOT_FOUND: 'User not found',
        UNAUTHORIZED: 'Not authorized to access this resource',
        TOKEN_EXPIRED: 'Your session has expired. Please login again'
    },
    NOTE: {
        UPLOAD_SUCCESS: 'Note uploaded successfully',
        UPDATE_SUCCESS: 'Note updated successfully',
        DELETE_SUCCESS: 'Note deleted successfully',
        NOT_FOUND: 'Note not found',
        ALREADY_LIKED: 'You have already liked this note',
        LIKE_REMOVED: 'Like removed successfully',
        LIKE_ADDED: 'Note liked successfully',
        DOWNLOAD_SUCCESS: 'Download started',
        INVALID_FILE_TYPE: 'Invalid file type'
    },
    BOOKMARK: {
        ADDED: 'Note bookmarked successfully',
        REMOVED: 'Bookmark removed successfully',
        ALREADY_EXISTS: 'Note is already bookmarked'
    },
    COMMENT: {
        ADDED: 'Comment added successfully',
        DELETED: 'Comment deleted successfully',
        NOT_FOUND: 'Comment not found'
    },
    RATING: {
        ADDED: 'Rating added successfully',
        UPDATED: 'Rating updated successfully',
        INVALID: 'Rating must be between 1 and 5'
    }
};

module.exports = {
    SUBJECTS,
    SEMESTERS,
    FILE_TYPE_ICONS,
    FILE_TYPE_COLORS,
    PAGINATION,
    SORT_OPTIONS,
    JWT_CONFIG,
    USER_ROLES,
    MESSAGES
};
