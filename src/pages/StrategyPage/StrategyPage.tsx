import cn from "classnames";
import { StrategyChart } from "src/components/StrategyChart";
import {
  Strategy,
  usdc_eth_unichain_my_may24_strategy,
} from "src/strategy/strategy";
import { PageRoot } from "src/components/PageRoot";
import { observer } from "mobx-react-lite";
import { H1 } from "src/components/H1";
import { StrategyControls } from "./components/StrategyControls";
import { OptionPosition } from "src/strategy/options";
import { UniswapV3Position } from "src/strategy/uniswap_v3";
import { useState, useRef, useEffect } from "react";
import { FuturePosition } from "src/strategy/futures";
import { assertNever } from "src/utils/assertNever";

interface SavedStrategy {
  name: string;
  positions: ReturnType<Strategy["positions"][number]["toJson"]>[];
  minPrice: number;
  maxPrice: number;
  daysInPosition: number;
  savedAt: string;
}

interface StrategyPageProps {
  className?: string;
}

export const StrategyPage = observer((props: StrategyPageProps) => {
  return (
    <PageRoot className={cn("flex flex-col gap-6", props.className)}>
      <div className="flex flex-col gap-2">
        <H1>Strategy calculator</H1>
        <StrategySaveRestore strategy={usdc_eth_unichain_my_may24_strategy} />
      </div>
      <StrategyChart strategy={usdc_eth_unichain_my_may24_strategy} />
      <StrategyControls strategy={usdc_eth_unichain_my_may24_strategy} />
    </PageRoot>
  );
});

const StrategySaveRestore = observer((props: { strategy: Strategy }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [savedStrategies, setSavedStrategies] = useState<SavedStrategy[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("saved_strategies");
    if (saved) {
      setSavedStrategies(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = () => {
    if (!props.strategy.name.trim()) {
      alert("Please enter a strategy name");
      return;
    }
    const serialized: SavedStrategy = {
      name: props.strategy.name,
      positions: props.strategy.positions.map((p) => p.toJson()),
      minPrice: props.strategy.minPrice,
      maxPrice: props.strategy.maxPrice,
      daysInPosition: props.strategy.daysInPosition,
      savedAt: new Date().toISOString(),
    };
    const updated = [...savedStrategies, serialized];
    localStorage.setItem("saved_strategies", JSON.stringify(updated));
    setSavedStrategies(updated);
  };

  const handleRestore = (strategyData: SavedStrategy) => {
    const positions = strategyData.positions.map((p) => {
      if (p.type === "option") {
        return OptionPosition.fromJson(p);
      } else if (p.type === "uniswap_v3") {
        return UniswapV3Position.fromJson(p);
      } else if (p.type === "future") {
        return FuturePosition.fromJson(p);
      } else {
        assertNever(p);
      }
    });

    Object.assign(props.strategy, {
      name: strategyData.name,
      positions,
      minPrice: strategyData.minPrice,
      maxPrice: strategyData.maxPrice,
      daysInPosition: strategyData.daysInPosition,
    });
    setIsDropdownOpen(false);
  };

  const handleDelete = (strategyName: string, savedAt: string) => {
    const updated = savedStrategies.filter(
      (s) => !(s.name === strategyName && s.savedAt === savedAt),
    );
    localStorage.setItem("saved_strategies", JSON.stringify(updated));
    setSavedStrategies(updated);
  };
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={props.strategy.name}
        onChange={(e) => (props.strategy.name = e.target.value)}
        placeholder="Strategy name"
        className="flex-1 rounded border px-4 py-2"
      />
      <button
        onClick={handleSave}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Save
      </button>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Restore
        </button>
        {isDropdownOpen && (
          <div className="absolute top-full right-0 z-10 mt-1 w-96 rounded border bg-white shadow-lg">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Saved At</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savedStrategies.map((s) => (
                    <tr
                      key={`${s.name}-${s.savedAt}`}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleRestore(s)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          {s.name}
                        </button>
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {new Date(s.savedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleDelete(s.name, s.savedAt)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
