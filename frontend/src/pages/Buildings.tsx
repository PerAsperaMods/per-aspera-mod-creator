import React, { useState } from 'react';
import { useBuildings } from '../hooks/useBuildings';
import { BuildingForm } from '../components/BuildingForm';
import { Building } from '../types';

export const Buildings: React.FC = () => {
  const { buildings, categories, resources, loading, error, createBuilding, updateBuilding, deleteBuilding } =
    useBuildings();
  const [showForm, setShowForm] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBuildings = buildings.filter(
    (b) =>
      b.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.name_label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (data: any) => {
    try {
      if (editingBuilding) {
        await updateBuilding(editingBuilding.id, data);
      } else {
        await createBuilding(data);
      }
      setShowForm(false);
      setEditingBuilding(undefined);
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure?')) {
      await deleteBuilding(id);
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-cyan-400">
            {editingBuilding ? 'Edit Building' : 'Create Building'}
          </h2>
        </div>
        <BuildingForm
          building={editingBuilding}
          resources={resources}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingBuilding(undefined);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-cyan-400">Buildings</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2 rounded transition-colors"
        >
          + New Building
        </button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search by key or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </div>

      {error && <div className="text-red-400">{error}</div>}

      {loading ? (
        <div className="text-slate-400">Loading buildings...</div>
      ) : (
        <div className="grid gap-4">
          {filteredBuildings.length === 0 ? (
            <div className="text-slate-400 text-center py-8">No buildings found</div>
          ) : (
            filteredBuildings.map((building) => (
              <div
                key={building.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-cyan-400 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-cyan-400">{building.key}</h3>
                    <p className="text-sm text-slate-400">{building.prefab_name}</p>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-xs">
                      {building.output_resource && (
                        <div>
                          <span className="text-slate-500">Output:</span>
                          <span className="ml-1 text-slate-300">{building.output_resource}</span>
                        </div>
                      )}
                      {building.power_consumption && (
                        <div>
                          <span className="text-slate-500">Power:</span>
                          <span className="ml-1 text-slate-300">{building.power_consumption}</span>
                        </div>
                      )}
                      {building.health && (
                        <div>
                          <span className="text-slate-500">Health:</span>
                          <span className="ml-1 text-slate-300">{building.health}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingBuilding(building);
                        setShowForm(true);
                      }}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(building.id)}
                      className="px-3 py-1 bg-red-900/50 hover:bg-red-800 text-red-400 rounded text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};