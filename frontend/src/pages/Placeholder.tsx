import React from 'react';

interface PlaceholderProps {
  title: string;
  icon: string;
}

export const Placeholder: React.FC<PlaceholderProps> = ({ title, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-3xl font-bold text-cyan-400 mb-2">{title}</h2>
      <p className="text-slate-400">Coming in Phase 6-8...</p>
      <div className="mt-8 bg-slate-700 rounded-lg p-6 max-w-md">
        <p className="text-sm text-slate-300 text-center">
          This page will have a full form for creating and editing {title.toLowerCase()}
        </p>
      </div>
    </div>
  );
};
