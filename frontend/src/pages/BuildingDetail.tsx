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
  category_key: string;
  prefab_name: string;
  output_resource?: string;
  output_quantity?: number;
  power_consumption?: number;
  health?: number;
  drone_capacity?: number;
}

export default function BuildingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [building, setBuilding] = useState<Building | null>(null);
  const [outputResource, setOutputResource] = useState<Resource | null>(null);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load building
        const buildingRes = await axios.get(`http://127.0.0.1:3001/api/buildings/${id}`);
        setBuilding(buildingRes.data.data);

        // Load all resources
        const resourcesRes = await axios.get('http://127.0.0.1:3001/api/resources');
        setAllResources(resourcesRes.data.data);

        // Load output resource
        if (buildingRes.data.data.output_resource) {
          const outRes = allResources.find(
            r => r.key === buildingRes.data.data.output_resource
          );
          if (outRes) setOutputResource(outRes);
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load building');
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!building) return <div className="text-center p-8">Building not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-8 border-b border-gray-700 pb-6">
        <div className="flex items-center justify-between mb-4">
          {/* Icon Placeholder */}
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-2xl">🏭</span>
          </div>

          {/* Title & Info */}
          <div className="flex-1 ml-6">
            <h1 className="text-3xl font-bold">{building.name_label}</h1>
            <p className="text-gray-400 text-sm">
              {building.category_key.replace('category_', '').toUpperCase()}
            </p>
          </div>

          {/* Mod Selector */}
          <div className="border border-gray-600 rounded px-4 py-2">
            <input
              type="text"
              value="Official Game Data"
              disabled
              className="bg-gray-900 text-gray-400 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-8 mb-8">
        {/* ENTREE (Input Resources) */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
              📥
            </span>
            ENTRÉE
          </h2>
          <div className="space-y-3">
            <p className="text-gray-400 text-sm">No input resources configured</p>
          </div>
        </div>

        {/* DISPLAY OUTPUT (Center) */}
        <div className="flex flex-col items-center justify-center">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-center mb-2">AFFICHAGE SORTIE</h3>
            <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center text-2xl">
              ⚙️
            </div>
          </div>

          {/* Building Stats */}
          <div className="bg-gray-800 rounded-lg p-4 w-full">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Power:</span>
                <span className="font-semibold">{building.power_consumption || 0} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Health:</span>
                <span className="font-semibold">{building.health || 100}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Drones:</span>
                <span className="font-semibold">{building.drone_capacity || 1}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SORTIE (Output Resource) */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
              📤
            </span>
            SORTIE
          </h2>
          {outputResource ? (
            <div className="border border-gray-600 rounded p-3 hover:bg-gray-800">
              <div
                className="w-12 h-12 rounded mb-2"
                style={{ backgroundColor: `#${outputResource.color}` }}
              />
              <p className="font-semibold text-sm">{outputResource.name_label}</p>
              <p className="text-gray-400 text-xs">{outputResource.key}</p>
              {building.output_quantity && (
                <p className="text-green-400 text-sm mt-1">{building.output_quantity} /min</p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No output resource</p>
          )}
        </div>
      </div>

      {/* Related Resources Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Ressources Similaires</h2>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2 text-xs">
                📥
              </span>
              ENTRÉE
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="border border-gray-600 rounded p-3 hover:bg-gray-800 cursor-pointer"
                >
                  <div className="w-full h-12 bg-gray-700 rounded mb-2" />
                  <p className="text-sm font-semibold">Ressource {i}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-2 text-xs">
                📤
              </span>
              SORTIE
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="border border-gray-600 rounded p-3 hover:bg-gray-800 cursor-pointer"
                >
                  <div className="w-full h-12 bg-gray-700 rounded mb-2" />
                  <p className="text-sm font-semibold">Ressource {i}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={() => navigate('/buildings')}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
        >
          ← Back
        </button>
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded transition">
          Edit Building
        </button>
        <button className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded transition">
          Delete
        </button>
      </div>
    </div>
  );
}
