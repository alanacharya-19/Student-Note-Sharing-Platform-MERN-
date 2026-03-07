import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import noteService from '../services/noteService';
import commentService from '../services/commentService';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import FileIcon from '../components/FileIcon';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Download, 
  Heart, 
  MessageCircle, 
  User, 
  Calendar,
  Send,
  FileText,
  Bookmark,
  Share2
} from 'lucide-react';

const NoteDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchNote();
    fetchComments();
  }, [id]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      const response = await noteService.getNoteById(id);
      console.log('Note response:', response);
      setNote(response.data?.data || response.data);
    } catch (error) {
      console.error('Fetch note error:', error);
      toast.error('Note not found');
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentService.getComments(id);
      console.log('Comments response:', response);
      // Handle both {data: {data: comments}} and {data: comments} structures
      const commentsData = response.data?.data || response.data || [];
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await noteService.likeNote(id);
      fetchNote();
      const message = response.data?.isLiked ? 'Note liked!' : 'Like removed!';
      toast.success(message);
    } catch (error) {
      console.error('Like error:', error);
      const message = error.response?.data?.message || 'Failed to like note';
      toast.error(message);
    }
  };

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        await noteService.removeBookmark(id);
        setIsBookmarked(false);
        toast.success('Bookmark removed');
      } else {
        await noteService.bookmarkNote(id);
        setIsBookmarked(true);
        toast.success('Note bookmarked!');
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      const message = error.response?.data?.message || 'Failed to bookmark';
      toast.error(message);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await noteService.downloadNote(id);
      
      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', note.fileName || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      fetchNote();
      toast.success('Download started!');
    } catch (error) {
      console.error('Download error:', error);
      const message = error.response?.data?.message || 'Download failed';
      toast.error(message);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const response = await commentService.addComment(id, newComment);
      console.log('Add comment response:', response);
      setNewComment('');
      
      // Add the new comment to the list immediately
      const newCommentData = response.data?.data || response.data;
      if (newCommentData) {
        setComments(prev => [newCommentData, ...prev]);
      } else {
        // Fallback: fetch all comments if we don't get the new comment back
        fetchComments();
      }
      
      toast.success('Comment added!');
    } catch (error) {
      console.error('Comment error:', error);
      const message = error.response?.data?.message || 'Failed to add comment';
      toast.error(message);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!note) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/browse')} 
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Browse
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Note Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4 mb-4">
              <FileIcon fileType={note.fileType} size="lg" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {note.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <Link 
                    to={`/user/${note.uploadedBy?._id}`}
                    className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {note.uploadedBy?.name}
                  </Link>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                {note.subject}
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                {note.semester}
              </span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {note.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleDownload} 
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download ({note.downloads})
            </button>
            <button 
              onClick={handleLike} 
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <Heart className="w-5 h-5" />
              Like ({note.likes?.length || 0})
            </button>
            <button 
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                isBookmarked 
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          {/* Comments Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Comments ({comments.length})
            </h2>

            {user ? (
              <form onSubmit={handleComment} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  rows="3"
                />
                <div className="mt-3 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={!newComment.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Post Comment
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Please{' '}
                  <button 
                    onClick={() => navigate('/login')} 
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    sign in
                  </button>
                  {' '}to comment
                </p>
              </div>
            )}

            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => {
                  // Handle both user and userId field names from backend
                  const commentUser = comment.user || comment.userId;
                  return (
                    <div key={comment._id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      {commentUser?.avatar ? (
                        <img
                          src={commentUser.avatar.startsWith('http') ? commentUser.avatar : `http://localhost:5000${commentUser.avatar}`}
                          alt={commentUser.name}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-200 dark:border-gray-600"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      {/* Fallback (hidden by default) */}
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center flex-shrink-0 hidden">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {commentUser?.name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Uploader Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              Uploaded By
            </h3>
            <Link 
              to={`/user/${note.uploadedBy?._id}`}
              className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 -m-2 rounded-xl transition-colors"
            >
              {note.uploadedBy?.avatar ? (
                <img
                  src={note.uploadedBy.avatar.startsWith('http') ? note.uploadedBy.avatar : `http://localhost:5000${note.uploadedBy.avatar}`}
                  alt={note.uploadedBy.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {note.uploadedBy?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              {/* Fallback (hidden by default) */}
              <div 
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full items-center justify-center hidden"
              >
                <span className="text-white font-bold text-lg">
                  {note.uploadedBy?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                  {note.uploadedBy?.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {note.uploadedBy?.college}
                </p>
              </div>
            </Link>
          </div>

          {/* File Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              File Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">File Type</span>
                <span className="font-medium text-gray-900 dark:text-white uppercase">
                  {note.fileType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">File Size</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {(note.fileSize / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Downloads</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {note.downloads}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Likes</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {note.likes?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetails;