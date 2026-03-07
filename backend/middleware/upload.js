const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Allowed file types
const ALLOWED_FILE_TYPES = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'text/plain': 'txt'
};

// Allowed extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.gif', '.txt'];

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `note-${uniqueSuffix}${extension}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_FILE_TYPES[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
    }
};

// Upload configuration for notes
const uploadNote = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
        files: 1
    }
});

// Upload configuration for avatars
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const avatarDir = path.join(uploadsDir, 'avatars');
        if (!fs.existsSync(avatarDir)) {
            fs.mkdirSync(avatarDir, { recursive: true });
        }
        cb(null, avatarDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `avatar-${uniqueSuffix}${extension}`);
    }
});

const avatarFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const allowedExts = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) && allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only .jpg, .jpeg, and .png files are allowed for avatars'), false);
    }
};

const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: avatarFileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB max for avatars
        files: 1
    }
});

// Delete file helper
const deleteFile = (filename, subfolder = '') => {
    return new Promise((resolve, reject) => {
        const filePath = subfolder 
            ? path.join(uploadsDir, subfolder, filename)
            : path.join(uploadsDir, filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) reject(err);
                else resolve(true);
            });
        } else {
            resolve(false);
        }
    });
};

// Get file type from mimetype
const getFileType = (mimetype) => {
    return ALLOWED_FILE_TYPES[mimetype] || 'unknown';
};

// Format file size
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
    uploadNote,
    uploadAvatar,
    deleteFile,
    getFileType,
    formatFileSize,
    ALLOWED_FILE_TYPES,
    ALLOWED_EXTENSIONS
};
