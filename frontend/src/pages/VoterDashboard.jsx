import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';

const VoterDashboard = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const { data } = await axios.get('/api/elections');
        setElections(data);
      } catch (error) {
        console.error('Failed to fetch elections');
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading elections...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Active Elections</h1>
        <p className="text-slate-600 mt-2 text-lg">Browse and participate in ongoing elections.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {elections.map((election) => (
          <div key={election._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${election.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{election.title}</h3>
              {election.isActive ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Active
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Ended
                </span>
              )}
            </div>
            <p className="text-slate-600 text-sm mb-6 flex-grow line-clamp-3">
              {election.description}
            </p>
            <div className="flex items-center text-xs text-slate-500 mb-6 bg-slate-50 p-2 rounded-lg gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                {new Date(election.endDate).toLocaleDateString()}
              </span>
            </div>
            <Link
              to={`/elections/${election._id}`}
              className={`w-full py-2.5 rounded-lg font-medium text-center transition-colors flex items-center justify-center gap-2 ${
                election.isActive
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{election.isActive ? 'Vote Now' : 'View Results'}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ))}

        {elections.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-500 text-lg">There are currently no active elections.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoterDashboard;
