import cn from "classnames";
import { StrategyChart } from "src/components/StrategyChart";
import { StrategyChart3D } from "src/components/StrategyChart3D";
import { Strategy } from "src/strategy/strategy";
import { PageRoot } from "src/components/PageRoot";
import { observer } from "mobx-react-lite";
import { H1 } from "src/components/H1";
import { StrategyControls } from "./components/StrategyControls";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { localStorageUtils, SavedStrategy } from "src/utils/localStorage";

interface StrategyPageProps {
  className?: string;
}

export const StrategyPage = observer((props: StrategyPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id === "new") {
      // Create a new strategy
      const newStrategy = new Strategy({
        daysInPosition: 0,
        spotPrice: 1600,
        name: "New Strategy",
        positions: [],
        priceRangePercent: 35,
        includeFeesInTotal: false,
        hiddenSeries: new Set(),
        show3dChart: false,
      });
      setStrategy(newStrategy);
      setLoading(false);
    } else if (id) {
      // Load existing strategy
      const loadedStrategy = localStorageUtils.loadStrategy(id);
      if (loadedStrategy) {
        setStrategy(loadedStrategy);
      } else {
        // Strategy not found, redirect to strategies list
        navigate("/strategies");
        return;
      }
      setLoading(false);
    } else {
      // No ID provided, create new strategy
      const newStrategy = new Strategy({
        daysInPosition: 0,
        spotPrice: 1600,
        name: "New Strategy",
        positions: [],
        priceRangePercent: 35,
        includeFeesInTotal: false,
        hiddenSeries: new Set(),
        show3dChart: false,
      });
      setStrategy(newStrategy);
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    return () => {
      if (strategy) {
        strategy.dispose();
      }
    };
  }, [strategy]);

  const handleSave = () => {
    if (!strategy) return;

    if (!strategy.name.trim()) {
      alert("Please enter a strategy name");
      return;
    }

    if (id && id !== "new") {
      // Update existing strategy
      localStorageUtils.updateStrategy(id, strategy);
    } else {
      // Save new strategy
      localStorageUtils.saveStrategy(strategy);
      // Redirect to the new strategy's page
      const savedStrategies = localStorageUtils.loadStrategies();
      const savedStrategy = savedStrategies.find(
        (s) => s.name === strategy.name,
      );
      if (savedStrategy) {
        navigate(`/strategy/${savedStrategy.id}`);
      }
    }
  };

  if (loading) {
    return (
      <PageRoot className={cn("flex flex-col gap-6", props.className)}>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading strategy...</div>
        </div>
      </PageRoot>
    );
  }

  if (!strategy) {
    return (
      <PageRoot className={cn("flex flex-col gap-6", props.className)}>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Strategy not found</div>
        </div>
      </PageRoot>
    );
  }

  return (
    <PageRoot className={cn("flex flex-col gap-6", props.className)}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/strategies")}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-gray-500 px-2 text-white hover:bg-gray-600"
          >
            {"<- Back"}
          </button>
          <H1>Strategy calculator</H1>
        </div>
        <div className={"flex justify-between gap-6"}>
          <input
            type="text"
            value={strategy.name}
            onChange={(e) => (strategy.name = e.target.value)}
            placeholder="Strategy name"
            className="flex-1 rounded border px-4 py-2"
          />
          <button
            onClick={handleSave}
            className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
      <StrategyChart strategy={strategy} />
      {strategy.show3dChart && <StrategyChart3D strategy={strategy} />}
      <StrategyControls strategy={strategy} />
    </PageRoot>
  );
});
