// Helper utility functions

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Format date with time
 * @param {Date} date - Date to format
 * @returns {string} Formatted date and time string
 */
const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Calculate time ago from date
 * @param {Date} date - Date to calculate from
 * @returns {string} Time ago string (e.g., "2 hours ago")
 */
const timeAgo = (date) => {
    if (!date) return '';
    
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return 'Just now';
};

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
const generateRandomString = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Sanitize filename by removing special characters
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
const sanitizeFilename = (filename) => {
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_');
};

/**
 * Create pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {object} Pagination metadata
 */
const createPagination = (page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
    };
};

/**
 * Build search query for MongoDB
 * @param {string} searchTerm - Search term
 * @param {string[]} fields - Fields to search in
 * @returns {object} MongoDB query object
 */
const buildSearchQuery = (searchTerm, fields = ['title', 'description']) => {
    if (!searchTerm || searchTerm.trim() === '') {
        return {};
    }
    
    const regex = new RegExp(searchTerm.trim(), 'i');
    return {
        $or: fields.map(field => ({ [field]: regex }))
    };
};

/**
 * Calculate average rating
 * @param {number[]} ratings - Array of ratings
 * @returns {number} Average rating rounded to 1 decimal
 */
const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((a, b) => a + b, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
};

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove sensitive fields from user object
 * @param {object} user - User object
 * @returns {object} User without sensitive fields
 */
const sanitizeUser = (user) => {
    if (!user) return null;
    const sanitized = { ...user.toObject ? user.toObject() : user };
    delete sanitized.password;
    delete sanitized.__v;
    return sanitized;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated text
 */
const truncateText = (text, length = 100) => {
    if (!text || text.length <= length) return text;
    return text.substring(0, length).trim() + '...';
};

module.exports = {
    formatDate,
    formatDateTime,
    timeAgo,
    generateRandomString,
    sanitizeFilename,
    createPagination,
    buildSearchQuery,
    calculateAverageRating,
    deepClone,
    sanitizeUser,
    isValidEmail,
    truncateText
};
