import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { YamlPreview } from '../components/YamlPreview';

export const Knowledge = () => {
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    key: '',
    name_label: '',
    value: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getKnowledge();
        if (response.success && response.data) setKnowledge(response.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.createKnowledge(formData);
      if (response.success && response.data) {
        setKnowledge([response.data, ...knowledge]);
        setFormData({ key: '', name_label: '', value: 1 });
        setShowForm(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredKnowledge = knowledge.filter(
    (k) =>
      k.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.name_label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const yamlPreview = Object.fromEntries(
    filteredKnowledge.map((k) => [
      k.key,
      {
        name: k.name_label,
        ...(k.value && { value: k.value }),
      },
    ])
  );

  if (showForm) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-cyan-400">Create Knowledge</h2>
        <div className="grid grid-cols-2 gap-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">Key</label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="knowledge_robotics"
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">Name Label</label>
              <input
                type="text"
                value={formData.name_label}
                onChange={(e) => setFormData({ ...formData, name_label: e.target.value })}
                placeholder="BE_knowledge_robotics"
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">Value</label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 rounded"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
          <YamlPreview data={{ [formData.key || 'know_key']: { name: formData.name_label } }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-cyan-400">Knowledge</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2 rounded"
        >
          + New Knowledge
        </button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div className="grid gap-4">
            {filteredKnowledge.length === 0 ? (
              <div className="text-slate-400">No knowledge found</div>
            ) : (
              filteredKnowledge.map((k) => (
                <div key={k.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-cyan-400">{k.key}</h3>
                  <p className="text-sm text-slate-400">{k.name_label}</p>
                  {k.value && <p className="text-xs text-slate-500">Value: {k.value}</p>}
                </div>
              ))
            )}
          </div>
          <YamlPreview data={yamlPreview} title="Knowledge YAML" />
        </div>
      )}
    </div>
  );
};
