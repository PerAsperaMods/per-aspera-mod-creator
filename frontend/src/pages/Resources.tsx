import React, { useState } from 'react';
import { useResources } from '../hooks/useResources';
import { ResourceForm } from '../components/ResourceForm';
import { Resource } from '../types';

export const Resources: React.FC = () => {
  const { resources, loading, error, createResource, updateResource, deleteResource } = useResources();
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResources = resources.filter(
    (r) =>
      r.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name_label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (data: any) => {
    try {
      if (editingResource) {
        await updateResource(editingResource.id, data);
      } else {
        await createResource(data);
      }
      setShowForm(false);
      setEditingResource(undefined);
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure?')) {
      await deleteResource(id);
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-cyan-400">
            {editingResource ? 'Edit Resource' : 'Create Resource'}
          </h2>
        </div>
        <ResourceForm
          resource={editingResource}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingResource(undefined);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-cyan-400">Resources</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2 rounded transition-colors"
        >
          + New Resource
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
        <div className="text-slate-400">Loading resources...</div>
      ) : (
        <div className="grid gap-4">
          {filteredResources.length === 0 ? (
            <div className="text-slate-400 text-center py-8">No resources found</div>
          ) : (
            filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-cyan-400 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded border-2"
                      style={{ backgroundColor: `#${resource.color}`, borderColor: `#${resource.color}` }}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-cyan-400">{resource.key}</h3>
                      <p className="text-sm text-slate-400">{resource.material_type}</p>
                      <p className="text-xs text-slate-500">{resource.prefab_name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingResource(resource);
                        setShowForm(true);
                      }}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
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
