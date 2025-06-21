import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { PageRoot } from "src/components/PageRoot";
import { H1 } from "src/components/H1";
import { localStorageUtils, SavedStrategy } from "src/utils/localStorage";

export const StrategiesListPage = observer(() => {
  const navigate = useNavigate();
  const [strategies, setStrategies] = useState<SavedStrategy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = () => {
    setLoading(true);
    try {
      const savedStrategies = localStorageUtils.loadStrategies();
      // Sort by last modified date (newest first)
      const sortedStrategies = savedStrategies.sort(
        (a, b) =>
          new Date(b.lastModified).getTime() -
          new Date(a.lastModified).getTime(),
      );
      setStrategies(sortedStrategies);
    } catch (error) {
      console.error("Failed to load strategies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewStrategy = () => {
    navigate("/strategy/new");
  };

  const handleStrategyClick = (id: string) => {
    navigate(`/strategy/${id}`);
  };

  const handleDeleteStrategy = (
    e: React.MouseEvent,
    id: string,
    name: string,
  ) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      localStorageUtils.deleteStrategy(id);
      loadStrategies(); // Reload the list
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };
  const header = (
    <div className="flex items-center justify-between">
      <H1>My Strategies</H1>
      <button
        className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        onClick={handleNewStrategy}
      >
        New Strategy
      </button>
    </div>
  );
  if (loading) {
    return (
      <PageRoot className="flex flex-col gap-6">
        {header}
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading strategies...</div>
        </div>
      </PageRoot>
    );
  }

  return (
    <PageRoot className="flex flex-col gap-6">
      {header}

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <ul className="divide-y divide-gray-200">
          {strategies.length > 0 ? (
            strategies.map((strategy) => (
              <li key={strategy.id}>
                <div className="block w-full px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleStrategyClick(strategy.id)}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-gray-900">
                        {strategy.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {strategy.positionsCount} position
                        {strategy.positionsCount !== 1 ? "s" : ""} • Last
                        modified {formatDate(strategy.lastModified)}
                      </div>
                    </button>
                    <button
                      onClick={(e) =>
                        handleDeleteStrategy(e, strategy.id, strategy.name)
                      }
                      className="ml-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Delete strategy"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">
                No strategies found. Create your first strategy to get started.
              </p>
            </div>
          )}
        </ul>
      </div>
    </PageRoot>
  );
});
