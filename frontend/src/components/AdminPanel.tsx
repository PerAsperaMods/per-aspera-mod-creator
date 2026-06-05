import { useState, useEffect } from 'react';
import axios from 'axios';

interface AdminStatus {
  itemCounts: Record<string, number>;
  totalItems: number;
  timestamp: Date;
}

export default function AdminPanel() {
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [modName, setModName] = useState('');
  const [modDesc, setModDesc] = useState('');
  const [showModForm, setShowModForm] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:3001/api/data-management/status');
      setStatus(res.data.data);
    } catch (err) {
      console.error('Failed to load status', err);
    }
  };

  const handlePurge = async () => {
    if (!window.confirm('⚠️ Delete ALL official game data? This cannot be undone!')) return;

    setLoading(true);
    setMessage('🗑️ Purging data...');

    try {
      const res = await axios.post('http://127.0.0.1:3001/api/data-management/purge');
      const report = res.data.data;

      setMessage(`✅ Purged ${Object.values(report.itemsDeleted).reduce((a: number, b: number) => a + b, 0)} items`);
      await loadStatus();
    } catch (err: any) {
      setMessage(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInstallSDK = async () => {
    setLoading(true);
    setMessage('📥 Installing SDK...');

    try {
      const res = await axios.post('http://127.0.0.1:3001/api/data-management/install-sdk');
      const report = res.data.data;

      if (report.status === 'already_installed') {
        setMessage(`✅ SDK already installed (${report.projectsCount} projects)`);
      } else {
        setMessage(`✅ SDK installed at ${report.sdkPath}`);
      }
    } catch (err: any) {
      setMessage(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInitMod = async () => {
    if (!modName.trim()) {
      setMessage('❌ Mod name is required');
      return;
    }

    setLoading(true);
    setMessage('📦 Creating mod project...');

    try {
      const res = await axios.post('http://127.0.0.1:3001/api/data-management/init-mod', {
        modName: modName.trim(),
        description: modDesc.trim(),
      });

      if (res.data.success) {
        const report = res.data.data;
        setMessage(`✅ Mod created at ${report.modPath}`);
        setModName('');
        setModDesc('');
        setShowModForm(false);
      } else {
        setMessage(`❌ ${report.message}`);
      }
    } catch (err: any) {
      setMessage(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-950/30 border border-red-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-red-400 mb-4">⚙️ Admin Control Panel</h2>

        {/* Status Grid */}
        {status && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">📊 Current Data Status</h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-gray-700 p-2 rounded">
                <p className="text-gray-400">Resources</p>
                <p className="text-white font-bold text-lg">{status.itemCounts.resources || 0}</p>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <p className="text-gray-400">Buildings</p>
                <p className="text-white font-bold text-lg">{status.itemCounts.buildings || 0}</p>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <p className="text-gray-400">Technologies</p>
                <p className="text-white font-bold text-lg">{status.itemCounts.technologies || 0}</p>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <p className="text-gray-400">Knowledge</p>
                <p className="text-white font-bold text-lg">{status.itemCounts.knowledge || 0}</p>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <p className="text-gray-400">Enhancements</p>
                <p className="text-white font-bold text-lg">{status.itemCounts.enhancements || 0}</p>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <p className="text-gray-400">Categories</p>
                <p className="text-white font-bold text-lg">{status.itemCounts.categories || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Functions Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Purge Function */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-400 mb-3">🗑️ Purge Data</h3>
            <p className="text-gray-400 text-sm mb-4">Delete all official game data and reset sequences</p>
            <button
              onClick={handlePurge}
              disabled={loading}
              className={`w-full px-4 py-2 rounded font-medium transition ${
                loading
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {loading ? '⏳ Processing...' : '🗑️ Purge Now'}
            </button>
          </div>

          {/* SDK Installation */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">📥 Install SDK</h3>
            <p className="text-gray-400 text-sm mb-4">Download & install Per Aspera SDK (C# projects)</p>
            <button
              onClick={handleInstallSDK}
              disabled={loading}
              className={`w-full px-4 py-2 rounded font-medium transition ${
                loading
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              {loading ? '⏳ Processing...' : '📥 Install SDK'}
            </button>
          </div>

          {/* Initialize Mod */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 col-span-2">
            <h3 className="text-lg font-semibold text-green-400 mb-3">📦 Create C# Mod Project</h3>
            <p className="text-gray-400 text-sm mb-4">Initialize a new BepInEx mod with boilerplate code</p>

            {!showModForm ? (
              <button
                onClick={() => setShowModForm(true)}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-medium transition"
              >
                📦 New Mod Project
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Mod name (e.g., MyAwesomeMod)"
                  value={modName}
                  onChange={(e) => setModName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={modDesc}
                  onChange={(e) => setModDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleInitMod}
                    disabled={loading}
                    className={`flex-1 px-3 py-2 rounded font-medium transition ${
                      loading
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-500 text-white'
                    }`}
                  >
                    {loading ? '⏳ Creating...' : '✅ Create'}
                  </button>
                  <button
                    onClick={() => setShowModForm(false)}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition"
                  >
                    ✖️ Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3 rounded text-sm ${
              message.startsWith('✅')
                ? 'bg-green-900/30 border border-green-600 text-green-400'
                : message.startsWith('❌')
                ? 'bg-red-900/30 border border-red-600 text-red-400'
                : 'bg-blue-900/30 border border-blue-600 text-blue-400'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
