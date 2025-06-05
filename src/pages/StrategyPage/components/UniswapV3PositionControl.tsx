import cn from "classnames";
import { observer } from "mobx-react-lite";
import { UniswapV3Position } from "src/strategy/uniswap_v3";
import { Block } from "src/components/Block";
import {
  TextField,
  InputAdornment,
  Typography,
  Grid,
  Switch,
  Box,
} from "@mui/material";

export const UniswapV3PositionControl = observer(
  (props: { position: UniswapV3Position; className?: string; onRemove: () => void }) => {
    return (
      <Block className={cn(
        "flex flex-col gap-4",
        props.className,
        !props.position.enabled && "opacity-50"
      )}>
        <div className="flex items-center gap-4">
          <Typography variant="h6">Uniswap v3</Typography>
          <TextField
            label="Lower Price"
            type="number"
            InputProps={{
              inputProps: { step: 10 },
            }}
            size="small"
            sx={{ width: 150 }}
            value={props.position.p_l || ''}
            onChange={(e) => {
              props.position.p_l = Number(e.target.value);
            }}
          />
          <TextField
            label="Upper Price"
            type="number"
            InputProps={{
              inputProps: { step: 10 },
            }}
            size="small"
            sx={{ width: 150 }}
            value={props.position.p_u || ''}
            onChange={(e) => {
              props.position.p_u = Number(e.target.value);
            }}
          />
          <TextField
            label="Initial Price"
            type="number"
            InputProps={{
              inputProps: { step: 10 },
            }}
            size="small"
            sx={{ width: 150 }}
            value={props.position.initialPriceInToken1 || ''}
            onChange={(e) => {
              props.position.initialPriceInToken1 = Number(e.target.value);
            }}
          />
          <div className="flex-grow" />
          <div className="flex items-center gap-2">
            <Switch
              checked={props.position.enabled}
              onChange={(e) => {
                props.position.enabled = e.target.checked;
              }}
            />
            <button
              onClick={props.onRemove}
              className="px-2 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        </div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <div className="flex items-center gap-4">
              <TextField
                label="APR %"
                type="number"
                InputProps={{
                  inputProps: { step: 1 },
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                size="small"
                sx={{ width: 150 }}
                value={props.position.apr || ''}
                onChange={(e) => {
                  props.position.apr = Number(e.target.value);
                }}
              />
              <TextField
                label="Position Value"
                type="number"
                InputProps={{
                  inputProps: { step: 100 },
                }}
                size="small"
                sx={{ width: 150 }}
                value={props.position.initialPositionValueInToken1 || ''}
                onChange={(e) => {
                  props.position.initialPositionValueInToken1 = Number(
                    e.target.value,
                  );
                }}
              />
              <div className="flex flex-col">
                <Typography variant="body2">
                  Token0: {props.position.initialTokenAmounts[0].toFixed(4)} ({((props.position.initialTokenAmounts[0] * props.position.initialPriceInToken1) / props.position.initialPositionValueInToken1 * 100).toFixed(2)}%)
                </Typography>
                <Typography variant="body2">
                  Token1: {props.position.initialTokenAmounts[1].toFixed(4)} ({(props.position.initialTokenAmounts[1] / props.position.initialPositionValueInToken1 * 100).toFixed(2)}%)
                </Typography>
              </div>
            </div>
          </Grid>
        </Grid>
        <Box mt={2}>
          <Grid container gap={2}>
            <Grid item xs={12}>
              <div className="flex items-center gap-4">
                <Typography variant="subtitle2">Custom Token Distribution</Typography>
                <Switch
                  checked={props.position.isCustomTokenDistribution}
                  onChange={(e) => {
                    props.position.isCustomTokenDistribution = e.target.checked;
                  }}
                />
                <TextField
                  label="Token0 Part"
                  type="number"
                  InputProps={{
                    inputProps: {
                      step: 0.05,
                      min: 0,
                      max: 1,
                    },
                  }}
                  size="small"
                  sx={{ width: 150 }}
                  disabled={!props.position.isCustomTokenDistribution}
                  value={props.position.t0Part || ''}
                  onChange={(e) => {
                    props.position.setCustomTokenDistribution(
                      Number(e.target.value),
                    );
                  }}
                />
                <div className="flex flex-col">
                  <Typography
                    variant="body2"
                    color={
                      props.position.isCustomTokenDistribution
                        ? "text.primary"
                        : "text.disabled"
                    }
                  >
                    Token0: {((props.position.initialPositionValueInToken1 * props.position.t0Part) / props.position.initialPriceInToken1).toFixed(4)} ({(props.position.t0Part * 100).toFixed(2)}%)
                  </Typography>
                  <Typography
                    variant="body2"
                    color={
                      props.position.isCustomTokenDistribution
                        ? "text.primary"
                        : "text.disabled"
                    }
                  >
                    Token1: {(props.position.initialPositionValueInToken1 * (1 - props.position.t0Part)).toFixed(4)} ({((1 - props.position.t0Part) * 100).toFixed(2)}%)
                  </Typography>
                </div>
              </div>
            </Grid>
          </Grid>
        </Box>
      </Block>
    );
  },
);
