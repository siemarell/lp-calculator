import cn from "classnames";
import { StrategyChart } from "src/components/StrategyChart";
import { Strategy } from "src/strategy/strategy";
import { PageRoot } from "src/components/PageRoot";
import { observer } from "mobx-react-lite";
import { H1 } from "src/components/H1";
import { StrategyControls } from "./components/StrategyControls";
import { useEffect, useRef, useState } from "react";

interface SavedStrategy {
  name: string;
  positions: ReturnType<Strategy["positions"][number]["toJson"]>[];
  spotPrice: number;
  daysInPosition: number;
  savedAt: string;
  hiddenSeries: string[];
}

interface StrategyPageProps {
  className?: string;
}

export const StrategyPage = observer((props: StrategyPageProps) => {
  const [strategy, setStrategy] = useState(
    new Strategy({
      daysInPosition: 0,
      spotPrice: 1600,
      name: "New Strategy",
      positions: [],
    }),
  );
  useEffect(() => {
    return () => strategy.dispose();
  }, [strategy]);

  return (
    <PageRoot className={cn("flex flex-col gap-6", props.className)}>
      <div className="flex flex-col gap-2">
        <H1>Strategy calculator</H1>
        <StrategySaveRestore strategy={strategy} onRestore={setStrategy} />
      </div>
      <StrategyChart strategy={strategy} />
      <StrategyControls strategy={strategy} />
    </PageRoot>
  );
});

const StrategySaveRestore = observer(
  (props: { strategy: Strategy; onRestore: (s: Strategy) => void }) => {
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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSave = () => {
      if (!props.strategy.name.trim()) {
        alert("Please enter a strategy name");
        return;
      }
      const serialized = props.strategy.toJson();

      // Remove any existing strategy with the same name
      const existingIndex = savedStrategies.findIndex(
        (s) => s.name === props.strategy.name,
      );
      const updated = [...savedStrategies];
      if (existingIndex >= 0) {
        updated[existingIndex] = serialized;
      } else {
        updated.push(serialized);
      }

      localStorage.setItem("saved_strategies", JSON.stringify(updated));
      setSavedStrategies(updated);
    };

    const handleRestore = (strategyData: SavedStrategy) => {
      props.onRestore(Strategy.fromJson(strategyData));
      setIsDropdownOpen(false);
    };

    const handleDelete = (strategyName: string) => {
      const updated = savedStrategies.filter((s) => s.name !== strategyName);
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
          className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Save
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="cursor-pointer rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
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
                      <tr key={s.name} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleRestore(s)}
                            className="cursor-pointer text-blue-500 hover:text-blue-700"
                          >
                            {s.name}
                          </button>
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {new Date(s.savedAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => handleDelete(s.name)}
                            className="cursor-pointer text-red-500 hover:text-red-700"
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
  },
);
