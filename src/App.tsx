import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StrategyPage } from "src/pages/StrategyPage/StrategyPage";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<StrategyPage />} />
          {/* Add more routes here as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
