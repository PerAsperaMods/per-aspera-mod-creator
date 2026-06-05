import { useState, useEffect } from 'react';
import axios from 'axios';

interface LoadingStats {
  resources: number;
  buildings: number;
  technologies: number;
  knowledge: number;
  categories: number;
  total: number;
}

export default function DataLoadingStatus() {
  const [stats, setStats] = useState<LoadingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    loadStats();
    // Refresh stats every 2 seconds
    const interval = setInterval(loadStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:3001/api/yaml-loader/stats');
      setStats(res.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load stats');
      setLoading(false);
    }
  };

  const triggerLoad = async () => {
    setTriggering(true);
    try {
      await axios.post('http://127.0.0.1:3001/api/yaml-loader/load-phase-1');
      // Refresh stats
      await loadStats();
    } catch (err) {
      setError('Failed to trigger load');
    } finally {
      setTriggering(false);
    }
  };

  if (loading) return <div className="text-gray-400">Loading data stats...</div>;

  const totalTarget = 2000;
  const progressPercent = stats ? (stats.total / totalTarget) * 100 : 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-cyan-400 mb-6">📦 Game Data Integration</h2>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-400 text-sm">Overall Progress</span>
          <span className="text-white font-bold">
            {stats?.total || 0} / {totalTarget} items
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all ${
              progressPercent > 50 ? 'bg-green-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
        <p className="text-gray-500 text-xs mt-2">{progressPercent.toFixed(1)}% complete</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 rounded p-4">
            <p className="text-gray-400 text-xs uppercase">Resources</p>
            <p className="text-white text-2xl font-bold mt-2">{stats.resources}</p>
            <p className="text-gray-500 text-xs mt-1">/ 41</p>
          </div>

          <div className="bg-gray-700 rounded p-4">
            <p className="text-gray-400 text-xs uppercase">Buildings</p>
            <p className="text-white text-2xl font-bold mt-2">{stats.buildings}</p>
            <p className="text-gray-500 text-xs mt-1">/ 79</p>
          </div>

          <div className="bg-gray-700 rounded p-4">
            <p className="text-gray-400 text-xs uppercase">Technologies</p>
            <p className="text-white text-2xl font-bold mt-2">{stats.technologies}</p>
            <p className="text-gray-500 text-xs mt-1">/ 500+</p>
          </div>

          <div className="bg-gray-700 rounded p-4">
            <p className="text-gray-400 text-xs uppercase">Knowledge</p>
            <p className="text-white text-2xl font-bold mt-2">{stats.knowledge}</p>
            <p className="text-gray-500 text-xs mt-1">/ 241</p>
          </div>

          <div className="bg-gray-700 rounded p-4">
            <p className="text-gray-400 text-xs uppercase">Enhancements</p>
            <p className="text-white text-2xl font-bold mt-2">
              {stats.total - stats.resources - stats.buildings - stats.technologies - stats.knowledge}
            </p>
            <p className="text-gray-500 text-xs mt-1">/ 100+</p>
          </div>

          <div className="bg-gray-700 rounded p-4">
            <p className="text-gray-400 text-xs uppercase">Categories</p>
            <p className="text-white text-2xl font-bold mt-2">{stats.categories}</p>
            <p className="text-gray-500 text-xs mt-1">/ 7</p>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && <p className="text-red-500 text-sm mb-4">❌ {error}</p>}

      {stats && stats.total > 0 && (
        <div className="bg-green-900/20 border border-green-600 rounded p-3 mb-4">
          <p className="text-green-400 text-sm">✅ Phase 1 Data Loaded</p>
          <p className="text-gray-400 text-xs mt-1">
            {stats.total} items ready. Continue to Phase 2 when ready.
          </p>
        </div>
      )}

      {stats && stats.total === 0 && (
        <div className="bg-yellow-900/20 border border-yellow-600 rounded p-3 mb-4">
          <p className="text-yellow-400 text-sm">⏳ No data loaded yet</p>
          <p className="text-gray-400 text-xs mt-1">Click "Load Phase 1" to start integrating game data.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={triggerLoad}
          disabled={triggering}
          className={`flex-1 px-4 py-2 rounded font-medium transition ${
            triggering
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white'
          }`}
        >
          {triggering ? '⏳ Loading...' : '📦 Load Phase 1'}
        </button>

        <button
          onClick={loadStats}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Info */}
      <p className="text-gray-500 text-xs mt-4">
        Phase 1 includes: resources, buildings, technologies, knowledge, enhancements, and categories.
        Total target: 2000+ items across 5 phases.
      </p>
    </div>
  );
}
