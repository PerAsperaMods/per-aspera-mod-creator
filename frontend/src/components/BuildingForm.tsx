import { useState, useEffect } from 'react';
import { Building, Resource, Category } from '../types';
import { YamlPreview } from './YamlPreview';

interface BuildingFormProps {
  building?: Building;
  resources: Resource[];
  categories: Category[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const BuildingForm: React.FC<BuildingFormProps> = ({
  building,
  resources,
  categories,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    key: '',
    name_label: '',
    description_label: '',
    category_key: '',
    prefab_name: '',
    compact_name: '',
    output_resource: '',
    output_quantity: 1,
    input_resources: {} as { [key: string]: number },
    required_resource_vein: '',
    power_consumption: 0,
    power_priority: 0,
    health: 100,
    drone_capacity: 0,
    icon_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputResourceKey, setInputResourceKey] = useState('');
  const [inputResourceQty, setInputResourceQty] = useState('1');

  useEffect(() => {
    if (building) {
      setFormData({
        key: building.key,
        name_label: building.name_label,
        description_label: building.description_label || '',
        category_key: building.category_key,
        prefab_name: building.prefab_name,
        compact_name: building.compact_name || '',
        output_resource: building.output_resource || '',
        output_quantity: building.output_quantity || 1,
        input_resources: building.input_resources || {},
        required_resource_vein: building.required_resource_vein || '',
        power_consumption: building.power_consumption || 0,
        power_priority: building.power_priority || 0,
        health: building.health || 100,
        drone_capacity: building.drone_capacity || 0,
        icon_name: building.icon_name || '',
      });
    }
  }, [building]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };

  const addInputResource = () => {
    if (inputResourceKey && inputResourceQty) {
      setFormData({
        ...formData,
        input_resources: {
          ...formData.input_resources,
          [inputResourceKey]: parseInt(inputResourceQty),
        },
      });
      setInputResourceKey('');
      setInputResourceQty('1');
    }
  };

  const removeInputResource = (key: string) => {
    const newInputResources = { ...formData.input_resources };
    delete newInputResources[key];
    setFormData({ ...formData, input_resources: newInputResources });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save building');
    } finally {
      setLoading(false);
    }
  };

  const yamlPreview = {
    [formData.key || 'building_key']: {
      categoryType: { _ref: formData.category_key },
      name: formData.name_label,
      prefabName: formData.prefab_name,
      ...(formData.compact_name && { compactName: formData.compact_name }),
      ...(formData.output_resource && {
        outputResource: { _ref: formData.output_resource },
      }),
      ...(formData.output_quantity && { outputQuantity: formData.output_quantity }),
      ...(Object.keys(formData.input_resources).length > 0 && {
        inputResources: formData.input_resources,
      }),
      ...(formData.power_consumption && {
        powerConsumption: formData.power_consumption,
      }),
      ...(formData.health && { maxHealth: formData.health }),
      ...(formData.drone_capacity && {
        droneCapacity: formData.drone_capacity,
      }),
    },
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">Key</label>
          <input
            type="text"
            name="key"
            value={formData.key}
            onChange={handleChange}
            placeholder="building_aluminum_mine"
            required
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">Category</label>
          <select
            name="category_key"
            value={formData.category_key}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.key}>
                {cat.name_label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">Name Label</label>
          <input
            type="text"
            name="name_label"
            value={formData.name_label}
            onChange={handleChange}
            placeholder="BE_building_aluminum_mine_name"
            required
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">Prefab Name</label>
          <input
            type="text"
            name="prefab_name"
            value={formData.prefab_name}
            onChange={handleChange}
            placeholder="AluminumMine_1"
            required
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">Power Consumption</label>
            <input
              type="number"
              name="power_consumption"
              value={formData.power_consumption}
              onChange={handleChange}
              step="0.1"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">Health</label>
            <input
              type="number"
              name="health"
              value={formData.health}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">Output Resource</label>
            <select
              name="output_resource"
              value={formData.output_resource}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
            >
              <option value="">None</option>
              {resources.map((r) => (
                <option key={r.id} value={r.key}>
                  {r.key}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">Output Qty</label>
            <input
              type="number"
              name="output_quantity"
              value={formData.output_quantity}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">Input Resources</label>
          <div className="flex gap-2 mb-2">
            <select
              value={inputResourceKey}
              onChange={(e) => setInputResourceKey(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
            >
              <option value="">Select resource</option>
              {resources.map((r) => (
                <option key={r.id} value={r.key}>
                  {r.key}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={inputResourceQty}
              onChange={(e) => setInputResourceQty(e.target.value)}
              className="w-20 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={addInputResource}
              className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded"
            >
              Add
            </button>
          </div>
          {Object.entries(formData.input_resources).map(([key, qty]) => (
            <div
              key={key}
              className="flex justify-between items-center bg-slate-800 p-2 rounded mb-1"
            >
              <span className="text-sm text-slate-300">
                {key}: {qty}
              </span>
              <button
                type="button"
                onClick={() => removeInputResource(key)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-medium py-2 rounded transition-colors"
          >
            {loading ? 'Saving...' : 'Save Building'}
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
