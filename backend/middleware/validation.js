const { body, param, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Auth validations
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ max: 100 }).withMessage('Name must be less than 100 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('college')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('College name must be less than 200 characters'),
    body('semester')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Semester must be less than 50 characters'),
    handleValidationErrors
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email'),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Name must be less than 100 characters'),
    body('college')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('College name must be less than 200 characters'),
    body('semester')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Semester must be less than 50 characters'),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
    handleValidationErrors
];

// Note validations
const noteUploadValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
    body('subject')
        .trim()
        .notEmpty().withMessage('Subject is required'),
    body('semester')
        .trim()
        .notEmpty().withMessage('Semester is required'),
    handleValidationErrors
];

const noteIdValidation = [
    param('id')
        .isMongoId().withMessage('Invalid note ID'),
    handleValidationErrors
];

// Comment validations
const commentValidation = [
    body('noteId')
        .notEmpty().withMessage('Note ID is required')
        .isMongoId().withMessage('Invalid note ID'),
    body('text')
        .trim()
        .notEmpty().withMessage('Comment text is required')
        .isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters'),
    handleValidationErrors
];

// Rating validations
const ratingValidation = [
    body('noteId')
        .notEmpty().withMessage('Note ID is required')
        .isMongoId().withMessage('Invalid note ID'),
    body('rating')
        .notEmpty().withMessage('Rating is required')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    handleValidationErrors
];

module.exports = {
    registerValidation,
    loginValidation,
    updateProfileValidation,
    noteUploadValidation,
    noteIdValidation,
    commentValidation,
    ratingValidation,
    handleValidationErrors
};
