import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

export const Mods: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [modData, setModData] = useState({
    modId: '',
    modName: '',
    description: '',
    version: '0.1.0',
    author: '',
  });
  const [selectedItems, setSelectedItems] = useState({
    resources: [] as number[],
    buildings: [] as number[],
    technologies: [] as number[],
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rResp, bResp, tResp] = await Promise.all([
          apiClient.getResources(),
          apiClient.getBuildings(),
          apiClient.getTechnologies(),
        ]);
        if (rResp.success && rResp.data) setResources(rResp.data);
        if (bResp.success && bResp.data) setBuildings(bResp.data);
        if (tResp.success && tResp.data) setTechnologies(tResp.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleSelection = (type: 'resources' | 'buildings' | 'technologies', id: number) => {
    setSelectedItems((prev) => {
      const current = prev[type];
      return {
        ...prev,
        [type]: current.includes(id) ? current.filter((i) => i !== id) : [...current, id],
      };
    });
  };

  const handleExport = async () => {
    if (!modData.modId || !modData.modName) {
      alert('Please fill in Mod ID and Mod Name');
      return;
    }

    setExporting(true);
    try {
      // Create mod manifest
      const manifest = {
        modId: modData.modId,
        modName: modData.modName,
        description: modData.description,
        version: modData.version,
        author: modData.author,
        compatibleGameVersions: ['1.8.x'],
        timestamp: new Date().toISOString(),
      };

      // Collect selected items
      const selectedResources = resources.filter((r) => selectedItems.resources.includes(r.id));
      const selectedBuildings = buildings.filter((b) => selectedItems.buildings.includes(b.id));
      const selectedTechs = technologies.filter((t) => selectedItems.technologies.includes(t.id));

      // Create JSON export (for now, would be YAML in real deployment)
      const exportData = {
        manifest,
        resources: selectedResources,
        buildings: selectedBuildings,
        technologies: selectedTechs,
        itemCounts: {
          resources: selectedResources.length,
          buildings: selectedBuildings.length,
          technologies: selectedTechs.length,
        },
      };

      // Download as JSON (in production, would generate YAML + ZIP)
      const element = document.createElement('a');
      element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`);
      element.setAttribute('download', `${modData.modId}_manifest.json`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      alert('✅ Mod exported! (JSON format - implement YAML + ZIP in Phase 9)');
    } catch (err) {
      alert('Export failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  const SelectionGrid = ({
    title,
    type,
    items,
  }: {
    title: string;
    type: 'resources' | 'buildings' | 'technologies';
    items: any[];
  }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-cyan-400 mb-3">
        {title} ({selectedItems[type].length}/{items.length})
      </h3>
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
        {items.map((item) => (
          <label key={item.id} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectedItems[type].includes(item.id)}
              onChange={() => toggleSelection(type, item.id)}
              className="w-4 h-4 rounded border-slate-600 text-cyan-500"
            />
            <span className="ml-2 text-sm text-slate-300">{item.key}</span>
          </label>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <div className="text-slate-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-cyan-400">🎮 Mods Manager</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Mod Info Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-cyan-400">Mod Information</h3>

          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">Mod ID</label>
            <input
              type="text"
              value={modData.modId}
              onChange={(e) => setModData({ ...modData, modId: e.target.value })}
              placeholder="my_awesome_mod"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">Mod Name</label>
            <input
              type="text"
              value={modData.modName}
              onChange={(e) => setModData({ ...modData, modName: e.target.value })}
              placeholder="My Awesome Mod"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">Description</label>
            <textarea
              value={modData.description}
              onChange={(e) => setModData({ ...modData, description: e.target.value })}
              placeholder="Describe your mod..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">Version</label>
              <input
                type="text"
                value={modData.version}
                onChange={(e) => setModData({ ...modData, version: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">Author</label>
              <input
                type="text"
                value={modData.author}
                onChange={(e) => setModData({ ...modData, author: e.target.value })}
                placeholder="Your Name"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-medium py-2 rounded mt-6 transition-colors"
          >
            {exporting ? 'Exporting...' : '📦 Export Mod as JSON'}
          </button>

          <div className="bg-slate-900 border border-slate-700 rounded p-3 mt-4">
            <p className="text-xs text-slate-400">
              <strong>Note:</strong> Currently exports as JSON. YAML + ZIP export coming in Phase 9.
            </p>
          </div>
        </div>

        {/* Selection Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-cyan-400">Select Content</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <SelectionGrid title="📦 Resources" type="resources" items={resources} />
            <SelectionGrid title="🏭 Buildings" type="buildings" items={buildings} />
            <SelectionGrid title="🔬 Technologies" type="technologies" items={technologies} />
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded p-4">
            <h4 className="text-sm font-semibold text-cyan-400 mb-2">Summary</h4>
            <div className="text-xs text-slate-400 space-y-1">
              <p>Resources: {selectedItems.resources.length}</p>
              <p>Buildings: {selectedItems.buildings.length}</p>
              <p>Technologies: {selectedItems.technologies.length}</p>
              <p className="mt-2 text-cyan-400">
                Total: {selectedItems.resources.length + selectedItems.buildings.length + selectedItems.technologies.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded p-4">
          <p className="text-cyan-400 font-semibold">Total Resources</p>
          <p className="text-2xl font-bold text-cyan-300">{resources.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded p-4">
          <p className="text-cyan-400 font-semibold">Total Buildings</p>
          <p className="text-2xl font-bold text-cyan-300">{buildings.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded p-4">
          <p className="text-cyan-400 font-semibold">Total Technologies</p>
          <p className="text-2xl font-bold text-cyan-300">{technologies.length}</p>
        </div>
      </div>
    </div>
  );
};
