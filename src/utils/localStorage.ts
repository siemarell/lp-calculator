import { Strategy } from '../strategy/strategy';

const STRATEGIES_STORAGE_KEY = 'saved_strategies';

export interface SavedStrategy {
  id: string;
  name: string;
  lastModified: string;
  positionsCount: number;
  data: ReturnType<Strategy['toJson']>;
}

export const localStorageUtils = {
  saveStrategy: (strategy: Strategy): void => {
    try {
      const existingStrategies = localStorageUtils.loadStrategies();
      const strategyData = strategy.toJson();
      const savedStrategy: SavedStrategy = {
        id: crypto.randomUUID(),
        name: strategy.name,
        lastModified: new Date().toISOString(),
        positionsCount: strategy.positions.length,
        data: strategyData,
      };
      
      existingStrategies.push(savedStrategy);
      localStorage.setItem(STRATEGIES_STORAGE_KEY, JSON.stringify(existingStrategies));
    } catch (error) {
      console.error('Failed to save strategy to localStorage:', error);
    }
  },

  loadStrategies: (): SavedStrategy[] => {
    try {
      const stored = localStorage.getItem(STRATEGIES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load strategies from localStorage:', error);
      return [];
    }
  },

  loadStrategy: (id: string): Strategy | null => {
    try {
      const strategies = localStorageUtils.loadStrategies();
      const savedStrategy = strategies.find(s => s.id === id);
      if (!savedStrategy) return null;
      
      return Strategy.fromJson(savedStrategy.data);
    } catch (error) {
      console.error('Failed to load strategy from localStorage:', error);
      return null;
    }
  },

  deleteStrategy: (id: string): void => {
    try {
      const strategies = localStorageUtils.loadStrategies();
      const filteredStrategies = strategies.filter(s => s.id !== id);
      localStorage.setItem(STRATEGIES_STORAGE_KEY, JSON.stringify(filteredStrategies));
    } catch (error) {
      console.error('Failed to delete strategy from localStorage:', error);
    }
  },

  updateStrategy: (id: string, strategy: Strategy): void => {
    try {
      const strategies = localStorageUtils.loadStrategies();
      const strategyData = strategy.toJson();
      const updatedStrategy: SavedStrategy = {
        id,
        name: strategy.name,
        lastModified: new Date().toISOString(),
        positionsCount: strategy.positions.length,
        data: strategyData,
      };
      
      const index = strategies.findIndex(s => s.id === id);
      if (index !== -1) {
        strategies[index] = updatedStrategy;
        localStorage.setItem(STRATEGIES_STORAGE_KEY, JSON.stringify(strategies));
      }
    } catch (error) {
      console.error('Failed to update strategy in localStorage:', error);
    }
  },
}; 