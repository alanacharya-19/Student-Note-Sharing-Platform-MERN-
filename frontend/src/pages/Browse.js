import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../services/api';
import NoteCard from '../components/NoteCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { Search, Filter, Sparkles } from 'lucide-react';

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Engineering', 'Medicine', 'Law', 'Business', 'Economics',
  'History', 'Geography', 'Literature', 'Philosophy', 'Psychology',
  'Sociology', 'Political Science', 'Art', 'Music', 'Languages', 'Other'
];

const SEMESTERS = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'];

const Browse = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    fetchNotes();
  }, [search, subject, semester, pagination.page]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = { 
        search, 
        subject, 
        semester, 
        page: pagination.page,
        limit: 12 
      };
      const res = await API.get('/notes', { params });
      const notesData = res.data?.data || [];
      setNotes(notesData);
      setPagination(res.data?.pagination || pagination);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setSearch('');
    setSubject('');
    setSemester('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = search || subject || semester;

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="w-8 h-8 text-blue-500" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Browse Notes
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Discover study materials shared by students
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-4">
            <select 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              {SUBJECTS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select 
              value={semester} 
              onChange={(e) => setSemester(e.target.value)} 
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Semesters</option>
              {SEMESTERS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        
        {hasActiveFilters && (
          <div className="mt-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                Search: {search}
              </span>
            )}
            {subject && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                {subject}
              </span>
            )}
            {semester && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                {semester}
              </span>
            )}
            <motion.button 
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 ml-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear all
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Results */}
      {loading ? (
        <div className="py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon="search"
          title="No notes found"
          description={hasActiveFilters 
            ? "Try adjusting your filters to find what you're looking for."
            : "No notes have been uploaded yet. Be the first to share!"
          }
          action={hasActiveFilters ? {
            label: 'Clear Filters',
            onClick: clearFilters
          } : {
            label: 'Upload Notes',
            onClick: () => window.location.href = '/upload'
          }}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="initial"
            animate="animate"
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
          >
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </motion.div>
          
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default Browse;