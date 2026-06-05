import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Resource {
  id: number;
  key: string;
  name_label: string;
  color: string;
  prefab_name: string;
}

interface Building {
  id: number;
  key: string;
  name_label: string;
  description_label?: string;
  category_key: string;
  prefab_name: string;
  compact_name?: string;
  output_resource?: string;
  output_quantity?: number;
  input_resources?: { [key: string]: number };
  required_resource_vein?: string;
  power_consumption?: number;
  power_priority?: number;
  health?: number;
  health_loss_per_day?: number;
  progress_per_day?: number;
  drone_capacity?: number;
  is_worker_hub?: boolean;
  required_construction_resources?: { [key: string]: number };
  rubble_prefab_name?: string;
  icon_name?: string;
  rival_icon_name?: string;
  empty_hub_icon_name?: string;
  progress_bar_names?: string[];
  extraction_level?: number;
  reserved_radius?: number;
  way_snap_radius?: number;
  knowledge_ref?: string;
}

export default function BuildingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [building, setBuilding] = useState<Building | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [buildingRes, resourcesRes] = await Promise.all([
          axios.get(`http://127.0.0.1:3001/api/buildings/${id}`),
          axios.get('http://127.0.0.1:3001/api/resources'),
        ]);
        setBuilding(buildingRes.data.data);
        setResources(resourcesRes.data.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load building');
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) return <div className="text-center p-8 text-gray-400">⏳ Loading...</div>;
  if (error) return <div className="text-red-500 p-8">❌ {error}</div>;
  if (!building) return <div className="text-center p-8 text-gray-400">Building not found</div>;

  const outputResource = resources.find(r => r.key === building.output_resource);

  const StatBox = ({ label, value, unit = '' }: { label: string; value: any; unit?: string }) => {
    if (value === undefined || value === null) return null;
    return (
      <div className="bg-gray-800 rounded p-3 border border-gray-700">
        <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
        <p className="text-white font-bold text-lg mt-1">
          {value} {unit}
        </p>
      </div>
    );
  };

  const InfoRow = ({ label, value }: { label: string; value: any }) => {
    if (value === undefined || value === null) return null;
    return (
      <div className="flex justify-between py-2 border-b border-gray-700 last:border-b-0">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-white font-medium">{String(value)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/buildings')}
          className="text-cyan-400 hover:text-cyan-300 text-sm mb-4 transition"
        >
          ← Back to Buildings
        </button>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-3xl">
            🏭
          </div>
          <div>
            <h1 className="text-4xl font-bold text-cyan-400">{building.key}</h1>
            <p className="text-gray-400 text-lg mt-1">{building.name_label}</p>
            <p className="text-gray-500 text-sm mt-2">
              Category: <span className="text-gray-300">{building.category_key}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatBox label="Power" value={building.power_consumption} unit="kW" />
        <StatBox label="Health" value={building.health} unit="HP" />
        <StatBox label="Drone Cap" value={building.drone_capacity} />
        <StatBox label="Output" value={building.output_quantity} unit="/min" />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Left Column: Resources */}
        <div className="space-y-6">
          {/* Output Resource */}
          {outputResource && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-green-400 mb-4">📤 Output Resource</h2>
              <div className="flex items-start gap-4">
                <div
                  className="w-20 h-20 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `#${outputResource.color}` }}
                />
                <div className="flex-1">
                  <p className="text-white font-semibold">{outputResource.name_label}</p>
                  <p className="text-gray-400 text-sm">{outputResource.key}</p>
                  {building.output_quantity && (
                    <p className="text-green-400 text-sm mt-2">
                      {building.output_quantity} units per minute
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Input Resources */}
          {building.input_resources && Object.keys(building.input_resources).length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-blue-400 mb-4">📥 Input Resources</h2>
              <div className="space-y-3">
                {Object.entries(building.input_resources).map(([resourceKey, quantity]) => {
                  const res = resources.find(r => r.key === resourceKey);
                  return (
                    <div key={resourceKey} className="flex items-center justify-between bg-gray-700 rounded p-3">
                      <div className="flex items-center gap-3">
                        {res && (
                          <div
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: `#${res.color}` }}
                          />
                        )}
                        <div>
                          <p className="text-white font-medium">{res?.name_label || resourceKey}</p>
                          <p className="text-gray-400 text-xs">{resourceKey}</p>
                        </div>
                      </div>
                      <p className="text-cyan-400 font-bold">{quantity}/min</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Construction Resources */}
          {building.required_construction_resources &&
            Object.keys(building.required_construction_resources).length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-yellow-400 mb-4">🛠️ Construction Cost</h2>
                <div className="space-y-3">
                  {Object.entries(building.required_construction_resources).map(([resourceKey, quantity]) => {
                    const res = resources.find(r => r.key === resourceKey);
                    return (
                      <div key={resourceKey} className="flex items-center justify-between bg-gray-700 rounded p-3">
                        <div className="flex items-center gap-3">
                          {res && (
                            <div
                              className="w-8 h-8 rounded"
                              style={{ backgroundColor: `#${res.color}` }}
                            />
                          )}
                          <div>
                            <p className="text-white font-medium">{res?.name_label || resourceKey}</p>
                            <p className="text-gray-400 text-xs">{resourceKey}</p>
                          </div>
                        </div>
                        <p className="text-yellow-400 font-bold">{quantity}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>

        {/* Right Column: Specifications */}
        <div className="space-y-6">
          {/* Core Specs */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-purple-400 mb-4">⚙️ Specifications</h2>
            <div className="space-y-2">
              <InfoRow label="Key" value={building.key} />
              <InfoRow label="Prefab Name" value={building.prefab_name} />
              {building.compact_name && <InfoRow label="Compact Name" value={building.compact_name} />}
              {building.required_resource_vein && (
                <InfoRow label="Required Vein" value={building.required_resource_vein} />
              )}
              {building.rubble_prefab_name && (
                <InfoRow label="Rubble Prefab" value={building.rubble_prefab_name} />
              )}
            </div>
          </div>

          {/* Performance Specs */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-orange-400 mb-4">📊 Performance</h2>
            <div className="space-y-2">
              <InfoRow label="Power Priority" value={building.power_priority} />
              {building.health_loss_per_day && (
                <InfoRow label="Health Loss/Day" value={building.health_loss_per_day} />
              )}
              {building.progress_per_day && (
                <InfoRow label="Progress/Day" value={building.progress_per_day} />
              )}
              {building.extraction_level && (
                <InfoRow label="Extraction Level" value={building.extraction_level} />
              )}
            </div>
          </div>

          {/* Radius & Flags */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-indigo-400 mb-4">🎯 Configuration</h2>
            <div className="space-y-2">
              {building.reserved_radius && (
                <InfoRow label="Reserved Radius (m)" value={building.reserved_radius} />
              )}
              {building.way_snap_radius && (
                <InfoRow label="Way Snap Radius (m)" value={building.way_snap_radius} />
              )}
              {building.is_worker_hub !== undefined && (
                <InfoRow label="Worker Hub" value={building.is_worker_hub ? '✅ Yes' : '❌ No'} />
              )}
            </div>
          </div>

          {/* Icons & References */}
          {(building.icon_name ||
            building.rival_icon_name ||
            building.empty_hub_icon_name ||
            building.knowledge_ref) && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-pink-400 mb-4">🔗 Assets & References</h2>
              <div className="space-y-2 text-sm">
                {building.icon_name && <InfoRow label="Icon" value={building.icon_name} />}
                {building.rival_icon_name && (
                  <InfoRow label="Rival Icon" value={building.rival_icon_name} />
                )}
                {building.empty_hub_icon_name && (
                  <InfoRow label="Empty Hub Icon" value={building.empty_hub_icon_name} />
                )}
                {building.knowledge_ref && <InfoRow label="Knowledge" value={building.knowledge_ref} />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/buildings')}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
        >
          ← Back
        </button>
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded transition">
          ✏️ Edit Building
        </button>
        <button className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded transition">
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
