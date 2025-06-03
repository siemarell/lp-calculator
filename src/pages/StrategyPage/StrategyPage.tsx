import cn from "classnames";
import { StrategyChart } from "src/components/StrategyChart";
import {
  Strategy,
  usdc_eth_unichain_my_may24_strategy,
} from "src/strategy/strategy";
import { PageRoot } from "src/components/PageRoot";
import { observer } from "mobx-react-lite";
import { assertNever } from "src/utils/assertNever";
import { OptionPosition, OptionType, PositionType } from "src/strategy/options";
import { Block } from "src/components/Block";
import { H4 } from "src/components/H4";
import { H3 } from "src/components/H3";
import { H1 } from "src/components/H1";
import { Separator } from "src/components/Separator";
import { UniswapV3Position } from "src/strategy/uniswap_v3";

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

const StrategyControls = observer(
  (props: { strategy: Strategy; className?: string }) => {
    return (
      <div className={cn("flex flex-col gap-4", props.className)}>
        <H3>Positions</H3>
        {props.strategy.positions.map((p) => {
          switch (p.type) {
            case "option":
              return <OptionPositionControl key={p.id} option={p} />;
            case "uniswap_v3":
              return null;
            default:
              assertNever(p);
          }
        })}
      </div>
    );
  },
);

const OptionPositionControl = observer(
  (props: { option: OptionPosition; className?: string }) => {
    return (
      <Block className={cn("flex flex-col gap-4", props.className)}>
        <H4 className={"flex gap-2"}>
          <input
            type={"radio"}
            onChange={(e) => {
              props.option.optionType = OptionType.CALL;
            }}
            checked={props.option.optionType === OptionType.CALL}
          />
          {OptionType.CALL}
          <input
            onChange={(e) => {
              console.log(e);
              props.option.optionType = OptionType.PUT;
            }}
            type={"radio"}
            checked={props.option.optionType === OptionType.PUT}
          />
          {OptionType.PUT}
          <Separator axis={"y"} />
          <input
            onChange={(e) => {
              if (e.target.checked) {
                props.option.position = PositionType.BUY;
              }
            }}
            type={"radio"}
            checked={props.option.position === PositionType.BUY}
          />
          {PositionType.BUY}
          <input
            onChange={(e) => {
              if (e.target.checked) {
                props.option.position = PositionType.SELL;
              }
            }}
            type={"radio"}
            checked={props.option.position === PositionType.SELL}
          />
          {PositionType.SELL}
        </H4>
        <div className={"flex items-center gap-4"}>
          <label className={"flex gap-2"}>
            Price
            <input
              step={0.5}
              type={"number"}
              className={"w-16 rounded-xl border px-2"}
              value={props.option.premium_per_item}
              onChange={(e) => {
                props.option.premium_per_item = Number(e.currentTarget.value);
              }}
            />
          </label>

          <label className={"flex gap-2"}>
            Quantity
            <input
              step={0.5}
              type={"number"}
              className={"w-16 rounded-xl border px-2"}
              value={props.option.quantity}
              onChange={(e) => {
                props.option.quantity = Number(e.currentTarget.value);
              }}
            />
          </label>

          <label className={"flex gap-2"}>
            Strike
            <input
              step={0.5}
              type={"number"}
              className={"w-20 rounded-xl border px-2"}
              value={props.option.strike_price}
              onChange={(e) => {
                props.option.strike_price = Number(e.currentTarget.value);
              }}
            />
          </label>
        </div>
      </Block>
    );
  },
);

const UniswapV3PositionControl = observer(
  (props: { position: UniswapV3Position; className?: string }) => {
    return <Block className={cn(props.className)}></Block>;
  },
);
