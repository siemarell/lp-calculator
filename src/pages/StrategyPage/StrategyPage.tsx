import cn from "classnames";
import { StrategyChart } from "src/components/StrategyChart";
import {
  usdc_eth_unichain_my_may24_strategy,
} from "src/strategy/strategy";
import { PageRoot } from "src/components/PageRoot";
import { observer } from "mobx-react-lite";
import { H1 } from "src/components/H1";
import { StrategyControls } from "./components/StrategyControls";
import { OptionPosition } from "src/strategy/options";
import { UniswapV3Position } from "src/strategy/uniswap_v3";
import { useState, useRef, useEffect } from "react";

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

interface StrategyPageProps {
  className?: string;
}

export const StrategyPage = observer((props: StrategyPageProps) => {
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = () => {
    if (!usdc_eth_unichain_my_may24_strategy.name.trim()) {
      alert("Please enter a strategy name");
      return;
    }
    const serialized: SavedStrategy = {
      name: usdc_eth_unichain_my_may24_strategy.name,
      positions: usdc_eth_unichain_my_may24_strategy.positions.map(p => {
        if (p.type === "option") {
          return {
            type: "option" as const,
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
            type: "uniswap_v3" as const,
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
      minPrice: usdc_eth_unichain_my_may24_strategy.minPrice,
      maxPrice: usdc_eth_unichain_my_may24_strategy.maxPrice,
      daysInPosition: usdc_eth_unichain_my_may24_strategy.daysInPosition,
      savedAt: new Date().toISOString(),
    };
    const updated = [...savedStrategies, serialized];
    localStorage.setItem("saved_strategies", JSON.stringify(updated));
    setSavedStrategies(updated);
  };

  const handleRestore = (strategyData: SavedStrategy) => {
    const positions = strategyData.positions.map(p => {
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

    Object.assign(usdc_eth_unichain_my_may24_strategy, {
      name: strategyData.name,
      positions,
      minPrice: strategyData.minPrice,
      maxPrice: strategyData.maxPrice,
      daysInPosition: strategyData.daysInPosition,
    });
    setIsDropdownOpen(false);
  };

  const handleDelete = (strategyName: string, savedAt: string) => {
    const updated = savedStrategies.filter(s => !(s.name === strategyName && s.savedAt === savedAt));
    localStorage.setItem("saved_strategies", JSON.stringify(updated));
    setSavedStrategies(updated);
  };

  return (
    <PageRoot className={cn("flex flex-col gap-6", props.className)}>
      <div className="flex flex-col gap-2">
        <H1>Strategy calculator</H1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={usdc_eth_unichain_my_may24_strategy.name}
            onChange={(e) => usdc_eth_unichain_my_may24_strategy.name = e.target.value}
            placeholder="Strategy name"
            className="px-4 py-2 border rounded flex-1"
          />
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Restore
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-96 bg-white border rounded shadow-lg z-10">
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
                        <tr key={`${s.name}-${s.savedAt}`} className="border-t hover:bg-gray-50">
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
      </div>
      <StrategyChart strategy={usdc_eth_unichain_my_may24_strategy} />
      <StrategyControls strategy={usdc_eth_unichain_my_may24_strategy} />
    </PageRoot>
  );
});
