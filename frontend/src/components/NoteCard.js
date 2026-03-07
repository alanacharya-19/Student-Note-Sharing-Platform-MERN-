import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Download, Bookmark } from 'lucide-react';
import FileIcon from './FileIcon';
import StarRating from './StarRating';

const NoteCard = ({ note, showBookmark = false, isBookmarked = false, onToggleBookmark = null }) => {
  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(note._id, isBookmarked);
    }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ 
        y: -8, 
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        transition: { type: 'spring', stiffness: 400, damping: 25 }
      }}
      transition={{ duration: 0.4 }}
    >
      <Link to={`/notes/${note._id}`} className="block">
        <div className="p-5">
          {/* Header with file icon and bookmark */}
          <div className="flex items-start justify-between mb-3">
            <FileIcon fileType={note.fileType} size="md" />
            {showBookmark && (
              <button
                onClick={handleBookmarkClick}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked 
                    ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                    : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {note.title}
          </h3>

          {/* Meta info */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {note.subject} • {note.semester}
          </p>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
            {note.description}
          </p>

          {/* Rating */}
          {note.averageRating > 0 && (
            <div className="mb-3">
              <StarRating 
                rating={note.averageRating} 
                totalRatings={note.totalRatings}
                size="sm"
              />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <Link 
              to={`/user/${note.uploadedBy?._id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 -ml-2 rounded-lg transition-colors"
            >
              {note.uploadedBy?.avatar ? (
                <img 
                  src={note.uploadedBy.avatar.startsWith('http') ? note.uploadedBy.avatar : `http://localhost:5000${note.uploadedBy.avatar}`}
                  alt={note.uploadedBy.name}
                  className="w-6 h-6 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {note.uploadedBy?.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                {note.uploadedBy?.name || 'Unknown'}
              </span>
            </Link>

            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                {note.likesCount || note.likes?.length || 0}
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-3.5 h-3.5" />
                {note.downloads || 0}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default NoteCard;