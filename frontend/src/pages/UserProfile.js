import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../services/authService';
import noteService from '../services/noteService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import NoteCard from '../components/NoteCard';
import { toast } from 'react-toastify';
import { 
  User, 
  Mail, 
  Building2, 
  GraduationCap, 
  FileText, 
  Download, 
  Heart,
  ArrowLeft,
  Award,
  Calendar,
  BookOpen,
  MapPin
} from 'lucide-react';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getUserById(userId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to load user');
      }
      
      const userData = response.data;
      
      if (!userData || !userData._id) {
        toast.error('User not found');
        navigate('/browse');
        return;
      }
      
      setUser(userData);
      setNotes(userData.notes || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'User not found');
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back Button */}
      <motion.button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        whileHover={{ x: -5 }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </motion.button>

      {/* Profile Header */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
          />
        </div>
        
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6 gap-4">
            {/* Avatar */}
            <motion.div 
              className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900">
                  <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              {/* Fallback (hidden by default) */}
              <div className="w-full h-full items-center justify-center bg-blue-100 dark:bg-blue-900 hidden">
                <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
            </motion.div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">College</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user?.college || 'Not specified'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Award className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Faculty</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user?.faculty || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Program</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user?.program || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <GraduationCap className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Semester</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user?.semester || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Notes Uploaded</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {notes.length}
                </p>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {user?.bio && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bio</p>
              <p className="text-gray-900 dark:text-white">{user.bio}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {[
          { icon: FileText, color: 'blue', label: 'Notes', value: notes.length },
          { icon: Download, color: 'green', label: 'Downloads', value: notes.reduce((sum, note) => sum + (note.downloads || 0), 0) },
          { icon: Heart, color: 'red', label: 'Likes Received', value: notes.reduce((sum, note) => sum + (note.likes?.length || 0), 0) },
          { icon: Calendar, color: 'purple', label: 'Joined', value: formatDate(user?.createdAt).split(' ')[0] }
        ].map((stat, index) => (
          <motion.div 
            key={stat.label}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* User's Notes Section */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Notes by {user?.name}
        </h2>
        
        {notes.length === 0 ? (
          <EmptyState
            icon="file"
            title="No notes yet"
            description={`${user?.name} hasn't uploaded any notes yet.`}
          />
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="initial"
            animate="animate"
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.5
                }
              }
            }}
          >
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default UserProfile;
