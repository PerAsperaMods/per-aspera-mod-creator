import React from 'react';
import DataLoadingStatus from '../components/DataLoadingStatus';

export const Home: React.FC = () => {
  const features = [
    { icon: '📦', title: 'Resources', desc: 'Create and manage game resources' },
    { icon: '🏭', title: 'Buildings', desc: 'Design building specifications' },
    { icon: '🔬', title: 'Technologies', desc: 'Research and tech tree' },
    { icon: '📂', title: 'Categories', desc: 'Organize by type' },
    { icon: '📚', title: 'Knowledge', desc: 'Knowledge base entries' },
    { icon: '🎮', title: 'Mods', desc: 'Package and export mods' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold text-cyan-400 mb-4">Welcome to Mod Creator</h2>
        <p className="text-xl text-slate-300">
          Create Per Aspera mods visually. No YAML editing required.
        </p>
      </div>

      {/* Data Loading Status */}
      <DataLoadingStatus />

      <div className="grid grid-cols-3 gap-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-slate-700 border border-slate-600 rounded-lg p-6 hover:border-cyan-400 transition-colors"
          >
            <div className="text-4xl mb-3">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">{feature.title}</h3>
            <p className="text-slate-400">{feature.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">📊 Backend Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>✅ Resources API</div>
          <div>✅ Buildings API</div>
          <div>✅ Technologies API</div>
          <div>✅ Categories API</div>
          <div>✅ Knowledge API</div>
          <div>✅ Mods API</div>
        </div>
      </div>

      <div className="bg-slate-800 border border-cyan-400/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">🚀 Getting Started</h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-300">
          <li>Navigate to Resources to create game resources</li>
          <li>Create Buildings that use those resources</li>
          <li>Define Technologies for your tech tree</li>
          <li>Organize with Categories</li>
          <li>Package everything into a Mod</li>
          <li>Export as YAML and deploy!</li>
        </ol>
      </div>
    </div>
  );
};
