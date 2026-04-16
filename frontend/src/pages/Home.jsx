import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, ShieldCheck, BarChart3 } from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 mb-6 drop-shadow-sm">
          Secure. Transparent. Modern.
        </h1>
        <p className="text-xl text-gray-600 dark:text-slate-400 mb-10 leading-relaxed font-medium">
          The next generation online voting platform. Cast your vote from anywhere with military-grade security and real-time verifiable results.
        </p>
        {!user ? (
          <div className="flex justify-center space-x-4">
            <Link to="/register" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg font-semibold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1">
              Get Started
            </Link>
            <Link to="/login" className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl text-lg font-semibold transition-all hover:-translate-y-1 shadow-sm">
              Sign In
            </Link>
          </div>
        ) : (
          <Link to={user.role === 'admin' ? '/admin' : '/voter'} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-lg font-semibold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1">
            Go to Dashboard
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-24 w-full">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center transition-all hover:scale-[1.02]">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Secure Identity</h3>
          <p className="text-slate-600 dark:text-slate-400">Advanced authentication ensures only authenticated voters can cast a ballot.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center transition-all hover:scale-[1.02]">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">One Person, One Vote</h3>
          <p className="text-slate-600 dark:text-slate-400">Our system cryptographically guarantees that double-voting is impossible.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center transition-all hover:scale-[1.02]">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
            <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Real-time Results</h3>
          <p className="text-slate-600 dark:text-slate-400">Watch the election unfold with live, transparent polling data and analytics.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
