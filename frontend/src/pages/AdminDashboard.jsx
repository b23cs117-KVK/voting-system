import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Settings, Plus, Users, Trash2, Calendar, Edit3 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newElection, setNewElection] = useState({ title: '', description: '', startDate: '', endDate: '' });

  const fetchElections = async () => {
    try {
      const { data } = await axios.get('/api/elections');
      setElections(data);
    } catch (error) {
      toast.error('Failed to fetch elections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

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
      // Convert to ISO strings to preserve the user's local timezone intended time
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
      fetchElections();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} election`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this election?')) {
      try {
        await axios.delete(`/api/elections/${id}`);
        toast.success('Election deleted');
        fetchElections();
      } catch (error) {
        toast.error('Failed to delete election');
      }
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage elections, candidates, and view results.</p>
        </div>
        <button
          onClick={() => { setIsEditMode(false); setShowCreateModal(true); }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>New Election</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Election Title</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date Range</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {elections.map((election) => (
                <tr key={election._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{election.title}</div>
                    <div className="text-sm text-slate-500 truncate max-w-xs">{election.description}</div>
                  </td>
                  <td className="p-4">
                    {election.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <button
                      onClick={() => handleEditClick(election)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-5 h-5 inline" />
                    </button>
                    <button className="text-indigo-600 hover:text-indigo-800 transition-colors" title="Manage Candidates" onClick={() => window.location.href=`/elections/${election._id}`}>
                      <Users className="w-5 h-5 inline" />
                    </button>
                    <button onClick={() => handleDelete(election._id)} className="text-rose-600 hover:text-rose-800 transition-colors" title="Delete">
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {elections.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    No elections found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              {isEditMode ? 'Edit Election' : 'Create New Election'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={newElection.title}
                  onChange={(e) => setNewElection({...newElection, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={newElection.description}
                  onChange={(e) => setNewElection({...newElection, description: e.target.value})}
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={newElection.startDate}
                    onChange={(e) => setNewElection({...newElection, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={newElection.endDate}
                    onChange={(e) => setNewElection({...newElection, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors"
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
