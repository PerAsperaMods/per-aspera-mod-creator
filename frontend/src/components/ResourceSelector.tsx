import React from 'react';
import { Resource } from '../types';

interface ResourceSelectorProps {
  resources: Resource[];
  selected: string[];
  onSelect: (selected: string[]) => void;
  label: string;
  multiple?: boolean;
}

export const ResourceSelector: React.FC<ResourceSelectorProps> = ({
  resources,
  selected,
  onSelect,
  label,
  multiple = true,
}) => {
  const handleToggle = (resourceKey: string) => {
    if (multiple) {
      if (selected.includes(resourceKey)) {
        onSelect(selected.filter((k) => k !== resourceKey));
      } else {
        onSelect([...selected, resourceKey]);
      }
    } else {
      onSelect(selected[0] === resourceKey ? [] : [resourceKey]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-cyan-400 mb-3">{label}</label>
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded p-3">
        {resources.map((resource) => (
          <label key={resource.id} className="flex items-center cursor-pointer">
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={label}
              checked={selected.includes(resource.key)}
              onChange={() => handleToggle(resource.key)}
              className="w-4 h-4 rounded border-slate-600 text-cyan-500"
            />
            <span className="ml-2 text-sm text-slate-300">{resource.key}</span>
            <div
              className="ml-auto w-4 h-4 rounded border"
              style={{
                backgroundColor: `#${resource.color}`,
                borderColor: `#${resource.color}`,
              }}
            />
          </label>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selected.map((key) => (
            <span
              key={key}
              className="bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded text-xs border border-cyan-700"
            >
              {key}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
