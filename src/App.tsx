import { useState } from "react";
import "./App.css";
import "./components/Button.css"; // Import for additional button variants

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="mb-4">Options Payoff Calculator</h1>
        <p className="mb-6 text-lg">React + Vite + TypeScript + Tailwind CSS</p>

        <div className="card mb-8">
          <h2 className="mb-4 text-xl font-semibold">Counter Example</h2>
          <div className="mb-4 flex flex-col justify-center gap-4 sm:flex-row">
            <button 
              className="btn-primary" 
              onClick={() => setCount(count + 1)}
            >
              Increment
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => setCount(count - 1)}
            >
              Decrement
            </button>
            <button 
              className="btn-outline" 
              onClick={() => setCount(0)}
            >
              Reset
            </button>
          </div>
          <p className="text-xl font-bold">Count: {count}</p>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Edit{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-700">
              src/App.tsx
            </code>{" "}
            and save to test HMR
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This project now uses Tailwind CSS for styling. All Python files
            have been moved to the _archive folder.
          </p>
        </div>
      </header>
    </div>
  );
}

export default App;
