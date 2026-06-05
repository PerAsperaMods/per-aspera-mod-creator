import React from 'react';

interface YamlPreviewProps {
  data: any;
  title?: string;
}

export const YamlPreview: React.FC<YamlPreviewProps> = ({ data, title = 'YAML Preview' }) => {
  const yamlString = JSON.stringify(data, null, 2);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-cyan-400 mb-3">{title}</h3>
      <pre className="text-xs text-slate-300 overflow-x-auto bg-slate-950 p-3 rounded border border-slate-800">
        <code>{yamlString}</code>
      </pre>
    </div>
  );
};
