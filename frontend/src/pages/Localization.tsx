import { useState, useEffect } from 'react';
import axios from 'axios';

interface Language {
  id: number;
  code: string;
  name: string;
  is_default: boolean;
}

interface TranslationEntry {
  key_id: number;
  key: string;
  default_text?: string;
  context?: string;
  translations: {
    [language_code: string]: {
      text: string;
      reviewed: boolean;
      translated_by?: string;
    };
  };
}

interface TranslationStat {
  code: string;
  name: string;
  total_keys: number;
  translated_keys: number;
  reviewed_keys: number;
  completion_percentage: number;
}

export default function Localization() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [keys, setKeys] = useState<TranslationEntry[]>([]);
  const [stats, setStats] = useState<TranslationStat[]>([]);
  const [selectedKey, setSelectedKey] = useState<TranslationEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingLang, setEditingLang] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [langRes, keysRes, statsRes] = await Promise.all([
        axios.get('http://127.0.0.1:3001/api/localization/languages'),
        axios.get('http://127.0.0.1:3001/api/localization/keys'),
        axios.get('http://127.0.0.1:3001/api/localization/stats'),
      ]);

      setLanguages(langRes.data.data);
      setKeys(keysRes.data.data);
      setStats(statsRes.data.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
      setLoading(false);
    }
  };

  const filteredKeys = keys.filter(
    k => k.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (k.context && k.context.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveTranslation = async (keyId: number, languageCode: string) => {
    if (!editText.trim()) return;

    try {
      await axios.post(`http://127.0.0.1:3001/api/localization/keys/${keyId}/translate`, {
        languageCode,
        translatedText: editText,
        translatedBy: 'user',
      });

      // Reload data
      await loadData();
      setEditingLang(null);
      setEditText('');
    } catch (err) {
      console.error('Failed to save translation:', err);
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-cyan-400 mb-6">🌍 Localization & Translation</h2>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {stats.map(stat => (
            <div key={stat.code} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm uppercase tracking-wider">{stat.name}</p>
              <p className="text-white font-bold text-2xl mt-2">{stat.completion_percentage}%</p>
              <p className="text-gray-500 text-xs mt-1">
                {stat.translated_keys}/{stat.total_keys} translated
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Keys List */}
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Search keys..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden max-h-96 overflow-y-auto">
            {filteredKeys.length === 0 ? (
              <div className="p-4 text-gray-400 text-center">No translation keys found</div>
            ) : (
              filteredKeys.map(key => (
                <button
                  key={key.key_id}
                  onClick={() => setSelectedKey(key)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-700 transition ${
                    selectedKey?.key_id === key.key_id ? 'bg-cyan-900 border-l-4 border-l-cyan-400' : ''
                  }`}
                >
                  <p className="text-white font-mono text-sm">{key.key}</p>
                  <p className="text-gray-400 text-xs mt-1">{key.default_text || 'No default'}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Translation Editor */}
        {selectedKey ? (
          <div className="col-span-2 space-y-4">
            {/* Key Info */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-cyan-400 mb-2">{selectedKey.key}</h3>
              {selectedKey.context && (
                <p className="text-gray-400 text-sm mb-3">Context: {selectedKey.context}</p>
              )}
              {selectedKey.default_text && (
                <p className="text-gray-300 text-sm">
                  <span className="text-gray-500">Default (EN):</span> {selectedKey.default_text}
                </p>
              )}
            </div>

            {/* Language Translations Grid */}
            <div className="grid grid-cols-2 gap-4">
              {languages.map(lang => {
                const trans = selectedKey.translations[lang.code];
                const isEditing = editingLang === lang.code;

                return (
                  <div key={lang.code} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-white">
                        {lang.name} {lang.is_default ? '(Default)' : ''}
                      </p>
                      {trans?.reviewed && (
                        <span className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded">
                          ✓ Reviewed
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none text-sm"
                          rows={3}
                          placeholder="Enter translation..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveTranslation(selectedKey.key_id, lang.code)}
                            className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingLang(null);
                              setEditText('');
                            }}
                            className="flex-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {trans ? (
                          <>
                            <p className="text-white text-sm break-words">{trans.text}</p>
                            <p className="text-gray-500 text-xs">
                              By {trans.translated_by || 'unknown'}
                            </p>
                            <button
                              onClick={() => {
                                setEditingLang(lang.code);
                                setEditText(trans.text);
                              }}
                              className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition"
                            >
                              Edit
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-500 italic text-sm">No translation yet</p>
                            <button
                              onClick={() => {
                                setEditingLang(lang.code);
                                setEditText('');
                              }}
                              className="w-full px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-sm transition"
                            >
                              Add Translation
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="col-span-2 bg-gray-800 rounded-lg p-12 border border-gray-700 flex items-center justify-center text-gray-400">
            <p>Select a translation key to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
