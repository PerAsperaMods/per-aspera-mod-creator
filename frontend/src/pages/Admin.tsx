import React from 'react';
import AdminPanel from '../components/AdminPanel';

export const Admin: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-red-400 mb-2">🔧 Administration</h1>
        <p className="text-xl text-slate-300">
          Manage game data, install SDK, and create mod projects
        </p>
      </div>

      <AdminPanel />

      {/* Info Box */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-cyan-400">📚 Admin Functions</h2>

        <div className="space-y-3 text-sm text-slate-300">
          <div>
            <h3 className="font-semibold text-yellow-400">🗑️ Purge Data</h3>
            <p>Removes all official game data (resources, buildings, technologies, etc.) and resets database sequences. Use this to start fresh with Phase 1 loading.</p>
          </div>

          <div>
            <h3 className="font-semibold text-cyan-400">📥 Install SDK</h3>
            <p>Downloads and installs the Per Aspera SDK from GitHub. The SDK provides C# libraries for plugin development (GameAPI, Climate, Events, Commands, Wrappers).</p>
          </div>

          <div>
            <h3 className="font-semibold text-green-400">📦 Create C# Mod</h3>
            <p>Creates a new BepInEx mod project with boilerplate code, .csproj configuration, and automatic linking to the SDK. Ready for development.</p>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-600 rounded p-3">
          <p className="text-blue-300 text-sm">
            <strong>⚠️ Note:</strong> These operations modify files on your system. Purge deletes data that must be reloaded. SDK installation requires git and internet. Mod creation requires dotnet CLI.
          </p>
        </div>
      </div>
    </div>
  );
};
