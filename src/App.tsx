import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { StrategyPage } from "src/pages/StrategyPage/StrategyPage";
import { StrategiesListPage } from "src/pages/StrategiesListPage/StrategiesListPage";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/lp-calculator/" element={<StrategiesListPage />} />
          <Route
            path="/lp-calculator/strategies"
            element={<StrategiesListPage />}
          />
          <Route
            path="/lp-calculator/strategy/new"
            element={<StrategyPage />}
          />
          <Route
            path="/lp-calculator/strategy/:id"
            element={<StrategyPage />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
