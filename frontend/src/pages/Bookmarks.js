import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import bookmarkService from '../services/bookmarkService';
import NoteCard from '../components/NoteCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { Bookmark } from 'lucide-react';

const Bookmarks = () => {
  const { user } = useContext(AuthContext);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    fetchBookmarks();
  }, [pagination.page]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await bookmarkService.getBookmarks({
        page: pagination.page,
        limit: 12
      });
      setBookmarks(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (noteId, isBookmarked) => {
    try {
      await bookmarkService.removeBookmark(noteId);
      toast.success('Bookmark removed');
      fetchBookmarks();
    } catch (error) {
      toast.error('Failed to remove bookmark');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Bookmarks
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Notes you've saved for later
        </p>
      </div>

      {/* Bookmarks Grid */}
      {bookmarks.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="No bookmarks yet"
          description="Start browsing and bookmark notes you want to save for later."
          action={{
            label: 'Browse Notes',
            onClick: () => window.location.href = '/browse'
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bookmarks.map((bookmark) => (
              <NoteCard
                key={bookmark._id}
                note={bookmark.note}
                showBookmark={true}
                isBookmarked={true}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default Bookmarks;
