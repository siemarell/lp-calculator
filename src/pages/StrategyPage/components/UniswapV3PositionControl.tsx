import cn from "classnames";
import { observer } from "mobx-react-lite";
import { UniswapV3Position } from "src/strategy/uniswap_v3";
import { Block } from "src/components/Block";
import { 
  TextField, 
  InputAdornment,
  Typography,
  Grid
} from "@mui/material";

export const UniswapV3PositionControl = observer(
  (props: { position: UniswapV3Position; className?: string }) => {
    return (
      <Block className={cn("flex flex-col gap-4", props.className)}>
        <Typography variant="h6">
          Uniswap v3
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
