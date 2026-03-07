import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import noteService from '../services/noteService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { 
  Users, 
  FileText, 
  Download, 
  MessageSquare, 
  Bookmark,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [pendingNotes, setPendingNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes] = await Promise.all([
        dashboardService.getAdminStats(),
        dashboardService.getPendingNotes({ limit: 5 })
      ]);
      setStats(statsRes.data);
      setPendingNotes(pendingRes.data);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveNote = async (noteId, isApproved) => {
    try {
      await noteService.updateApprovalStatus(noteId, isApproved);
      toast.success(`Note ${isApproved ? 'approved' : 'rejected'} successfully`);
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to update note status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.name}. Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.overview.totalUsers}
            color="bg-blue-500"
          />
          <StatCard
            icon={FileText}
            label="Total Notes"
            value={stats.overview.totalNotes}
            color="bg-green-500"
          />
          <StatCard
            icon={Download}
            label="Total Downloads"
            value={stats.overview.totalDownloads}
            color="bg-purple-500"
          />
          <StatCard
            icon={AlertCircle}
            label="Pending Approval"
            value={stats.overview.pendingNotes}
            color="bg-orange-500"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {['overview', 'pending', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Notes
            </h3>
            <div className="space-y-3">
              {stats.recentNotes?.map((note) => (
                <div
                  key={note._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{note.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      by {note.uploadedBy?.name}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Contributors
            </h3>
            <div className="space-y-3">
              {stats.topContributors?.map((contributor, index) => (
                <div
                  key={contributor._id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {contributor.userName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {contributor.notesCount} notes
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {contributor.totalDownloads} downloads
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Approval ({pendingNotes.length})
            </h3>
          </div>
          {pendingNotes.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No pending notes to approve
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {pendingNotes.map((note) => (
                <div key={note._id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {note.uploadedBy?.avatar ? (
                      <img
                        src={note.uploadedBy.avatar}
                        alt={note.uploadedBy.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {note.uploadedBy?.name?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{note.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {note.uploadedBy?.name} • {note.subject}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveNote(note._id, true)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproveNote(note._id, false)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notes by Subject */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notes by Subject
            </h3>
            <div className="space-y-3">
              {stats.notesBySubject?.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <span className="w-32 text-sm text-gray-600 dark:text-gray-400 truncate">
                    {item._id}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(item.count / Math.max(...stats.notesBySubject.map(s => s.count))) * 100}%`
                      }}
                    />
                  </div>
                  <span className="w-12 text-sm text-gray-500 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User Growth */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              User Growth (Last 6 Months)
            </h3>
            <div className="space-y-3">
              {stats.userGrowth?.map((item) => (
                <div key={`${item._id.year}-${item._id.month}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    +{item.count} users
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
