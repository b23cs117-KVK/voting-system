import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Settings, Plus, Users, Trash2, Calendar, Edit3, Shield, User as UserIcon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('elections');
  const [elections, setElections] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newElection, setNewElection] = useState({ title: '', description: '', startDate: '', endDate: '' });

  const { user: currentUser } = useContext(AuthContext);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'elections') {
        const { data } = await axios.get('/api/elections');
        setElections(data);
      } else {
        const { data } = await axios.get('/api/users');
        setUsers(data);
      }
    } catch (error) {
      toast.error(`Failed to fetch ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Helper to format Date for <input type="datetime-local">
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleEditClick = (election) => {
    setEditingId(election._id);
    setNewElection({
      title: election.title,
      description: election.description || '',
      startDate: formatDateForInput(election.startDate),
      endDate: formatDateForInput(election.endDate),
    });
    setIsEditMode(true);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setIsEditMode(false);
    setEditingId(null);
    setNewElection({ title: '', description: '', startDate: '', endDate: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const electionData = {
        title: newElection.title,
        description: newElection.description,
        startDate: new Date(newElection.startDate).toISOString(),
        endDate: new Date(newElection.endDate).toISOString(),
      };

      if (isEditMode) {
        await axios.put(`/api/elections/${editingId}`, electionData);
        toast.success('Election updated successfully');
      } else {
        await axios.post('/api/elections', electionData);
        toast.success('Election created successfully');
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} election`);
    }
  };

  const handleDeleteElection = async (id) => {
    if (window.confirm('Are you sure you want to delete this election?')) {
      try {
        await axios.delete(`/api/elections/${id}`);
        toast.success('Election deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete election');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/users/${id}`);
        toast.success('User removed');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to remove user');
      }
    }
  };

  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'voter' : 'admin';
    const confirmMessage = targetUser.role === 'admin' 
      ? `Are you sure you want to demote ${targetUser.name} to Voter?`
      : `Are you sure you want to promote ${targetUser.name} to Admin?`;

    if (window.confirm(confirmMessage)) {
      try {
        await axios.put(`/api/users/${targetUser._id}/role`, { role: newRole });
        toast.success(`User role updated to ${newRole}`);
        fetchData();
      } catch (error) {
        toast.error('Failed to update role');
      }
    }
  };

  if (loading && (elections.length === 0 && users.length === 0)) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage elections, users, and platform security.</p>
        </div>
        {activeTab === 'elections' && (
          <button
            onClick={() => { setIsEditMode(false); setShowCreateModal(true); }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>New Election</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('elections')}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'elections'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Elections</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'users'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manage Users</span>
        </button>
      </div>

      {/* Content Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === 'elections' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Election Title</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Date Range</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {elections.map((election) => (
                  <tr key={election._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-800 dark:text-white">{election.title}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">{election.description}</div>
                    </td>
                    <td className="p-4">
                      {election.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button
                        onClick={() => handleEditClick(election)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-5 h-5 inline" />
                      </button>
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors" title="Manage Candidates" onClick={() => window.location.href=`/elections/${election._id}`}>
                        <Users className="w-5 h-5 inline" />
                      </button>
                      <button onClick={() => handleDeleteElection(election._id)} className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 transition-colors" title="Delete">
                        <Trash2 className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
                {elections.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <p className="text-slate-500 dark:text-slate-400">No elections found assigned to you.</p>
                        <button
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to permanently remove all orphaned elections? This will delete Kitsw, mini_project, and any others created by deleted admins.')) {
                              try {
                                const { data } = await axios.get('/api/elections/rescue/now');
                                toast.success(data.message);
                                fetchData();
                              } catch (error) {
                                toast.error('Cleanup failed');
                              }
                            }
                          }}
                          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                          Remove Orphaned Elections
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Joined</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold uppercase">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 dark:text-white">
                            {u.name} {u._id === currentUser?._id && <span className="text-xs text-blue-500 ml-1">(You)</span>}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => u._id !== currentUser?._id && handleToggleRole(u)}
                        disabled={u._id === currentUser?._id}
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          u.role === 'admin'
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                        } ${u._id !== currentUser?._id ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'opacity-75'}`}
                      >
                        {u.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <UserIcon className="w-3 h-3 mr-1" />}
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </button>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {u._id !== currentUser?._id && (
                        <button 
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                          title="Remove User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
              {isEditMode ? 'Edit Election' : 'Create New Election'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all"
                  value={newElection.title}
                  onChange={(e) => setNewElection({...newElection, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all"
                  value={newElection.description}
                  onChange={(e) => setNewElection({...newElection, description: e.target.value})}
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all"
                    value={newElection.startDate}
                    onChange={(e) => setNewElection({...newElection, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all"
                    value={newElection.endDate}
                    onChange={(e) => setNewElection({...newElection, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  {isEditMode ? 'Save Changes' : 'Create Election'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
