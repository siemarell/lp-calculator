import cn from "classnames";
import { observer } from "mobx-react-lite";
import { Strategy } from "src/strategy/strategy";
import { H3 } from "src/components/H3";
import { assertNever } from "src/utils/assertNever";
import { OptionPositionControl } from "./OptionPositionControl";
import { UniswapV3PositionControl } from "./UniswapV3PositionControl";
import { FuturePositionControl } from "./FuturePositionControl";
import { StrategySettingsControl } from "./StrategySettingsControl";
import { Button, Stack } from "@mui/material";

export const StrategyControls = observer(
  (props: { strategy: Strategy; className?: string }) => {
    return (
      <div className={cn("flex flex-col gap-4", props.className)}>
        <StrategySettingsControl strategy={props.strategy} />
        <H3>Positions</H3>
        {props.strategy.positions.map((p) => {
          switch (p.type) {
            case "option":
              return (
                <OptionPositionControl 
                  key={p.id} 
                  option={p} 
                  onRemove={() => props.strategy.removePosition(p.id)} 
                />
              );
            case "uniswap_v3":
              return (
                <UniswapV3PositionControl 
                  key={p.id} 
                  position={p} 
                  onRemove={() => props.strategy.removePosition(p.id)} 
                />
              );
            case "future":
              return (
                <FuturePositionControl 
                  key={p.id} 
                  position={p} 
                  onRemove={() => props.strategy.removePosition(p.id)} 
                />
              );
            default:
              assertNever(p);
          }
        })}
        <Stack direction="row" spacing={2} className="mt-4">
          <Button 
            variant="outlined" 
            onClick={() => props.strategy.addOptionPosition()}
          >
            Add Option
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => props.strategy.addUniswapV3Position()}
          >
            Add Uniswap V3
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => props.strategy.addFuturePosition()}
          >
            Add Future
          </Button>
        </Stack>
      </div>
    );
  },
);
