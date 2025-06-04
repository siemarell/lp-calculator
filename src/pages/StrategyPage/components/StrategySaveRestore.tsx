import { observer } from "mobx-react-lite";
import { Strategy } from "src/strategy/strategy";
import { OptionPosition } from "src/strategy/options";
import { UniswapV3Position } from "src/strategy/uniswap_v3";
import { useState, useEffect } from "react";

interface SavedStrategy {
  name: string;
  positions: Array<{
    type: "option" | "uniswap_v3";
    data: any;
  }>;
  minPrice: number;
  maxPrice: number;
  daysInPosition: number;
  savedAt: string;
}

const STORAGE_KEY = "saved_strategies";

const serializeStrategy = (strategy: Strategy): SavedStrategy => {
  return {
    name: strategy.name,
    positions: strategy.positions.map(p => {
      if (p.type === "option") {
        return {
          type: "option",
          data: {
            optionType: p.optionType,
            position: p.position,
            quantity: p.quantity,
            strike_price: p.strike_price,
            premium_per_item: p.premium_per_item,
          }
        };
      } else {
        return {
          type: "uniswap_v3",
          data: {
            p_l: p.p_l,
            p_u: p.p_u,
            initialPriceInToken1: p.initialPriceInToken1,
            initialPositionValueInToken1: p.initialPositionValueInToken1,
            t0Part: p.t0Part,
            apr: p.apr,
          }
        };
      }
    }),
    minPrice: strategy.minPrice,
    maxPrice: strategy.maxPrice,
    daysInPosition: strategy.daysInPosition,
    savedAt: new Date().toISOString(),
  };
};

const deserializeStrategy = (data: SavedStrategy): Strategy => {
  const positions = data.positions.map(p => {
    if (p.type === "option") {
      return new OptionPosition(
        p.data.optionType,
        p.data.position,
        p.data.quantity,
        p.data.strike_price,
        p.data.premium_per_item,
      );
    } else {
      return new UniswapV3Position(p.data);
    }
  });

  return new Strategy({
    name: data.name,
    positions,
    minPrice: data.minPrice,
    maxPrice: data.maxPrice,
    daysInPosition: data.daysInPosition,
  });
};

export const StrategySaveRestore = observer(({ strategy }: { strategy: Strategy }) => {
  const [savedStrategies, setSavedStrategies] = useState<SavedStrategy[]>([]);
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
    const serialized = serializeStrategy(strategy);
    const updated = [...savedStrategies, serialized];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSavedStrategies(updated);
  };

  const handleRestore = () => {
    if (!selectedStrategy) return;
    const strategyData = savedStrategies.find(s => s.name === selectedStrategy);
    if (!strategyData) return;

    const restored = deserializeStrategy(strategyData);
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