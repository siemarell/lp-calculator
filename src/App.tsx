import "./App.css";
import { StrategyChart } from "./components/StrategyChart";
import { usdc_eth_unichain_my_may24_strategy } from "./strategy/strategy";

function App() {
  return (
    <div className="App">
      <StrategyChart strategy={usdc_eth_unichain_my_may24_strategy} />
    </div>
  );
}

export default App;
