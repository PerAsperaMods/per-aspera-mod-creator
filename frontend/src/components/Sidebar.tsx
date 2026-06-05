import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: '🏠 Home' },
    { path: '/resources', label: '📦 Resources' },
    { path: '/buildings', label: '🏭 Buildings' },
    { path: '/technologies', label: '🔬 Technologies' },
    { path: '/categories', label: '📂 Categories' },
    { path: '/knowledge', label: '📚 Knowledge' },
    { path: '/mods', label: '🎮 Mods' },
    { path: '/localization', label: '🌍 Localization' },
  ];

  return (
    <nav className="w-64 bg-slate-800 h-screen border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-cyan-400">🚀 Mod Creator</h1>
        <p className="text-sm text-slate-400 mt-1">Per Aspera</p>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`block px-6 py-3 border-l-4 transition-colors ${
                isActive(item.path)
                  ? 'bg-slate-700 border-cyan-400 text-cyan-400 font-medium'
                  : 'border-transparent text-slate-300 hover:bg-slate-700 hover:text-cyan-400'
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="p-6 border-t border-slate-700">
        <p className="text-xs text-slate-500">v0.1.0</p>
        <p className="text-xs text-slate-400 mt-2">Backend: ✅ Running</p>
      </div>
    </nav>
  );
};
