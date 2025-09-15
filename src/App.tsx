import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { StrategyPage } from "src/pages/StrategyPage/StrategyPage";
import { StrategiesListPage } from "src/pages/StrategiesListPage/StrategiesListPage";
import { ROUTES } from "src/utils/routes";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path={ROUTES.ROOT} element={<StrategiesListPage />} />
          <Route path={ROUTES.ROOT} element={<StrategiesListPage />} />
          <Route path={ROUTES.STRATEGIES_NEW} element={<StrategyPage />} />
          <Route path={ROUTES.STRATEGIES_PAGE} element={<StrategyPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
