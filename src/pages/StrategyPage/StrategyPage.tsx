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
import { 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  FormLabel, 
  TextField, 
  InputAdornment,
  Typography,
  Grid
} from "@mui/material";

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
              return <UniswapV3PositionControl key={p.id} position={p} />;
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
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Option Type</FormLabel>
              <RadioGroup
                row
                value={props.option.optionType}
                onChange={(e) => {
                  props.option.optionType = e.target.value as OptionType;
                }}
              >
                <FormControlLabel 
                  value={OptionType.CALL} 
                  control={<Radio />} 
                  label={OptionType.CALL} 
                />
                <FormControlLabel 
                  value={OptionType.PUT} 
                  control={<Radio />} 
                  label={OptionType.PUT} 
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Position Type</FormLabel>
              <RadioGroup
                row
                value={props.option.position}
                onChange={(e) => {
                  props.option.position = e.target.value as PositionType;
                }}
              >
                <FormControlLabel 
                  value={PositionType.BUY} 
                  control={<Radio />} 
                  label={PositionType.BUY} 
                />
                <FormControlLabel 
                  value={PositionType.SELL} 
                  control={<Radio />} 
                  label={PositionType.SELL} 
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Price"
              type="number"
              InputProps={{
                inputProps: { step: 0.5 }
              }}
              size="small"
              value={props.option.premium_per_item}
              onChange={(e) => {
                props.option.premium_per_item = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Quantity"
              type="number"
              InputProps={{
                inputProps: { step: 0.5 }
              }}
              size="small"
              value={props.option.quantity}
              onChange={(e) => {
                props.option.quantity = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Strike"
              type="number"
              InputProps={{
                inputProps: { step: 0.5 }
              }}
              size="small"
              value={props.option.strike_price}
              onChange={(e) => {
                props.option.strike_price = Number(e.target.value);
              }}
            />
          </Grid>
        </Grid>
      </Block>
    );
  },
);

const UniswapV3PositionControl = observer(
  (props: { position: UniswapV3Position; className?: string }) => {
    return (
      <Block className={cn("flex flex-col gap-4", props.className)}>
        <Typography variant="h6">
          {props.position.label}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Lower Price"
              type="number"
              InputProps={{
                inputProps: { step: 10 }
              }}
              size="small"
              fullWidth
              value={props.position.p_l}
              onChange={(e) => {
                props.position.p_l = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Upper Price"
              type="number"
              InputProps={{
                inputProps: { step: 10 }
              }}
              size="small"
              fullWidth
              value={props.position.p_u}
              onChange={(e) => {
                props.position.p_u = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Initial Price"
              type="number"
              InputProps={{
                inputProps: { step: 10 }
              }}
              size="small"
              fullWidth
              value={props.position.initialPriceInToken1}
              onChange={(e) => {
                props.position.initialPriceInToken1 = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Position Value"
              type="number"
              InputProps={{
                inputProps: { step: 100 }
              }}
              size="small"
              fullWidth
              value={props.position.initialPositionValueInToken1}
              onChange={(e) => {
                props.position.initialPositionValueInToken1 = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Token0 Part"
              type="number"
              InputProps={{
                inputProps: { 
                  step: 0.05,
                  min: 0,
                  max: 1
                }
              }}
              size="small"
              fullWidth
              value={props.position.t0Part ?? 0.5}
              onChange={(e) => {
                props.position.t0Part = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="APR %"
              type="number"
              InputProps={{
                inputProps: { step: 1 },
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }}
              size="small"
              fullWidth
              value={props.position.apr}
              onChange={(e) => {
                props.position.apr = Number(e.target.value);
              }}
            />
          </Grid>
        </Grid>
      </Block>
    );
  },
);
