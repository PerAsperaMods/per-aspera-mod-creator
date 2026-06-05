import React, { useState, useEffect } from 'react';
import { Resource } from '../types';
import { YamlPreview } from './YamlPreview';

interface ResourceFormProps {
  resource?: Resource;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const MATERIAL_TYPES = ['Mined', 'Manufactured', 'Released', 'Placeholder'];

export const ResourceForm: React.FC<ResourceFormProps> = ({ resource, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    key: '',
    color: 'CCCCCC',
    material_type: 'Mined',
    name_label: '',
    prefab_name: '',
    icon_name: '',
    show_in_scanner: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resource) {
      setFormData({
        key: resource.key,
        color: resource.color,
        material_type: resource.material_type,
        name_label: resource.name_label,
        prefab_name: resource.prefab_name,
        icon_name: resource.icon_name || '',
        show_in_scanner: resource.show_in_scanner,
      });
    }
  }, [resource]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save resource');
    } finally {
      setLoading(false);
    }
  };

  const yamlPreview = {
    [formData.key || 'resource_key']: {
      color: formData.color,
      materialType: formData.material_type,
      name: formData.name_label,
      prefabName: formData.prefab_name,
      ...(formData.icon_name && { iconName: formData.icon_name }),
      showInScannerLens: formData.show_in_scanner,
    },
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">Key (ID)</label>
          <input
            type="text"
            name="key"
            value={formData.key}
            onChange={handleChange}
            placeholder="resource_aluminum"
            required
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">Material Type</label>
          <select
            name="material_type"
            value={formData.material_type}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
          >
            {MATERIAL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              name="color"
              value={`#${formData.color}`}
              onChange={(e) => setFormData({ ...formData, color: e.target.value.slice(1) })}
              className="w-12 h-10 rounded border border-slate-700 cursor-pointer"
            />
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value.toUpperCase() })}
              placeholder="CCCCCC"
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">Name Label</label>
          <input
            type="text"
            name="name_label"
            value={formData.name_label}
            onChange={handleChange}
            placeholder="BE_resource_aluminum_name"
            required
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">Prefab Name</label>
          <input
            type="text"
            name="prefab_name"
            value={formData.prefab_name}
            onChange={handleChange}
            placeholder="Aluminum"
            required
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">Icon Name</label>
          <input
            type="text"
            name="icon_name"
            value={formData.icon_name}
            onChange={handleChange}
            placeholder="Icons/Aluminum"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="show_in_scanner"
            checked={formData.show_in_scanner}
            onChange={handleChange}
            className="w-4 h-4 rounded border-slate-700 text-cyan-400"
          />
          <label className="ml-3 text-sm text-slate-300">Show in Scanner Lens</label>
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-medium py-2 rounded transition-colors"
          >
            {loading ? 'Saving...' : 'Save Resource'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      <div>
        <YamlPreview data={yamlPreview} title="YAML Preview" />
      </div>
    </div>
  );
};
