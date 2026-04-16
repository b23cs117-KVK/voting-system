import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2, CheckCircle, BarChart2, Edit } from 'lucide-react';

const ElectionPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Admin state
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateDesc, setNewCandidateDesc] = useState('');
  const [editingCandidate, setEditingCandidate] = useState(null);

  const fetchData = async () => {
    try {
      const [electionRes, candidatesRes] = await Promise.all([
        axios.get(`/api/elections/${id}`),
        axios.get(`/api/candidates/${id}`)
      ]);
      setElection(electionRes.data);
      setCandidates(candidatesRes.data);

      let userHasVoted = false;
      if (user.role === 'voter') {
        const votedRes = await axios.get(`/api/votes/check/${id}`);
        userHasVoted = votedRes.data.hasVoted;
        setHasVoted(userHasVoted);
      }

      // Fetch results if election has ended or if admin or if user has voted
      if (user.role === 'admin' || !electionRes.data.isActive || userHasVoted) {
        const resultsRes = await axios.get(`/api/votes/results/${id}`);
        setResults(resultsRes.data);
      }
    } catch (error) {
      toast.error('Failed to load election data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user.role, hasVoted]);

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      if (editingCandidate) {
        await axios.put(`/api/candidates/${editingCandidate._id}`, {
          name: newCandidateName,
          description: newCandidateDesc
        });
        toast.success('Candidate updated');
        setEditingCandidate(null);
      } else {
        await axios.post('/api/candidates', {
          name: newCandidateName,
          description: newCandidateDesc,
          electionId: id
        });
        toast.success('Candidate added');
      }
      setNewCandidateName('');
      setNewCandidateDesc('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save candidate');
    }
  };

  const handleEditClick = (candidate) => {
    setEditingCandidate(candidate);
    setNewCandidateName(candidate.name);
    setNewCandidateDesc(candidate.description);
    // Scroll to form (optional but helpful)
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (window.confirm('Delete this candidate?')) {
      try {
        await axios.delete(`/api/candidates/${candidateId}`);
        toast.success('Candidate deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete candidate');
      }
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate first');
      return;
    }

    try {
      await axios.post('/api/votes', {
        electionId: id,
        candidateId: selectedCandidate
      });
      toast.success('Vote cast successfully!');
      setHasVoted(true);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cast vote');
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading election details...</div>;
  if (!election) return <div className="text-center py-20 text-slate-500">Election not found.</div>;

  const showResults = user.role === 'admin' || !election.isActive || hasVoted;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Election Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1.5 ${election.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">{election.title}</h1>
        <p className="text-lg text-slate-600 mb-6">{election.description}</p>
        <div className="inline-flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
          <span className="text-sm font-medium text-slate-500">Status:</span>
          {election.isActive ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
            </span>
          ) : (
            <span className="text-slate-600 font-bold">Ended</span>
          )}
        </div>
      </div>

      {user.role === 'voter' && !hasVoted && election.isActive && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold text-blue-800 mb-2">Cast Your Vote</h3>
          <p className="text-blue-600 mb-6">Select a candidate below and submit your vote. You cannot change it later.</p>
        </div>
      )}

      {user.role === 'voter' && hasVoted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
          <h3 className="text-2xl font-bold text-emerald-800 mb-2">Vote Recorded</h3>
          <p className="text-emerald-600">Thank you for participating. Your vote is secure.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Candidates List Form */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Candidates
            <span className="text-sm font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {candidates.length}
            </span>
          </h2>
          
          <div className="space-y-4">
            {candidates.map((candidate) => {
              const result = results?.results?.find(r => r.candidate._id === candidate._id);
              const votePercentage = results?.totalVotes > 0 ? ((result?.votes || 0) / results.totalVotes) * 100 : 0;

              return (
                <div 
                  key={candidate._id} 
                  className={`bg-white rounded-xl border p-5 transition-all
                    ${user.role === 'voter' && !hasVoted && election.isActive 
                      ? selectedCandidate === candidate._id 
                        ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20' 
                        : 'border-slate-200 hover:border-blue-300 cursor-pointer hover:shadow-md'
                      : 'border-slate-200 shadow-sm'
                    }
                  `}
                  onClick={() => {
                    if (user.role === 'voter' && !hasVoted && election.isActive) {
                      setSelectedCandidate(candidate._id);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{candidate.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{candidate.description}</p>
                    </div>
                    {user.role === 'admin' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditClick(candidate); }}
                          className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteCandidate(candidate._id); }}
                          className="text-rose-500 hover:text-rose-700 bg-rose-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {user.role === 'voter' && !hasVoted && election.isActive && (
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 
                        ${selectedCandidate === candidate._id ? 'border-blue-600' : 'border-slate-300'}
                      `}>
                        {selectedCandidate === candidate._id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                      </div>
                    )}
                  </div>

                  {showResults && result !== undefined && (
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <div className="flex justify-between text-sm font-medium mb-1.5">
                        <span className="text-slate-600">Votes: {result.votes}</span>
                        <span className="text-slate-800">{votePercentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${votePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {candidates.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                <p className="text-slate-500">No candidates available yet.</p>
              </div>
            )}
          </div>

          {user.role === 'voter' && !hasVoted && election.isActive && candidates.length > 0 && (
            <button
              onClick={handleVote}
              disabled={!selectedCandidate}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
            >
              Confirm Vote
            </button>
          )}
        </div>

        {/* Action Panel: Admin Add / Status */}
        <div className="space-y-6">
          {user.role === 'admin' ? (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 sticky top-24">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                {editingCandidate ? (
                  <Edit className="w-5 h-5 text-blue-600" />
                ) : (
                  <Plus className="w-5 h-5 text-blue-600" />
                )}
                {editingCandidate ? 'Edit Candidate' : 'Add Candidate'}
              </h3>
              <form onSubmit={handleAddCandidate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Platform / Description</label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={newCandidateDesc}
                    onChange={(e) => setNewCandidateDesc(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-grow bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    {editingCandidate ? 'Update Candidate' : 'Save Candidate'}
                  </button>
                  {editingCandidate && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCandidate(null);
                        setNewCandidateName('');
                        setNewCandidateDesc('');
                      }}
                      className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
             showResults && (
              <div className="bg-slate-800 text-white rounded-2xl p-6 border border-slate-700 sticky top-24">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-blue-400" />
                  Turnout Summary
                </h3>
                <div className="text-center py-6 bg-slate-900 rounded-xl">
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    {results?.totalVotes || 0}
                  </div>
                  <div className="text-slate-400 mt-2 font-medium uppercase tracking-wider text-sm">Total Votes Cast</div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectionPage;
