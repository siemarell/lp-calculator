import { observer } from "mobx-react-lite";
import { Strategy } from "src/strategy/strategy";
import { useState, useEffect } from "react";

const STORAGE_KEY = "saved_strategies";

export const StrategySaveRestore = observer(({ strategy }: { strategy: Strategy }) => {
  const [savedStrategies, setSavedStrategies] = useState<any[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSavedStrategies(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    if (!strategy.name.trim()) {
      alert("Please enter a strategy name");
      return;
    }
    const serialized = strategy.toJson();
    const updated = [...savedStrategies, serialized];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSavedStrategies(updated);
  };

  const handleRestore = () => {
    if (!selectedStrategy) return;
    const strategyData = savedStrategies.find(s => s.name === selectedStrategy);
    if (!strategyData) return;

    const restored = Strategy.fromJson(strategyData);
    Object.assign(strategy, restored);
  };

  const handleDelete = (strategyName: string) => {
    const updated = savedStrategies.filter(s => s.name !== strategyName);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSavedStrategies(updated);
    if (selectedStrategy === strategyName) {
      setSelectedStrategy("");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded">
      <h3 className="text-lg font-semibold">Save/Restore Strategy</h3>
      
      {/* Save/Restore controls */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={strategy.name}
          onChange={(e) => strategy.name = e.target.value}
          placeholder="Strategy name"
          className="px-4 py-2 border rounded flex-1"
        />
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save
        </button>
        <select
          value={selectedStrategy}
          onChange={(e) => setSelectedStrategy(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">Restore strategy...</option>
          {savedStrategies.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name} ({formatDate(s.savedAt)})
            </option>
          ))}
        </select>
      </div>

      {/* Saved strategies list */}
      {savedStrategies.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Saved Strategies:</h4>
          <div className="flex flex-col gap-2">
            {savedStrategies.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{s.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    (Saved: {formatDate(s.savedAt)})
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(s.name)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}); 