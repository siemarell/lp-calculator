import cn from "classnames";
import { StrategyChart } from "src/components/StrategyChart";
import {
  usdc_eth_unichain_my_may24_strategy,
} from "src/strategy/strategy";
import { PageRoot } from "src/components/PageRoot";
import { observer } from "mobx-react-lite";
import { H1 } from "src/components/H1";
import { StrategyControls } from "./components/StrategyControls";

interface StrategyPageProps {
  className?: string;
}

export const StrategyPage = observer((props: StrategyPageProps) => {
  return (
    <PageRoot className={cn("flex flex-col gap-6", props.className)}>
      <H1>Strategy calculator</H1>
      <StrategyChart strategy={usdc_eth_unichain_my_may24_strategy} />
      <StrategyControls strategy={usdc_eth_unichain_my_may24_strategy} />
    </PageRoot>
  );
});
