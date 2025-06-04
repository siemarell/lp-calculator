import cn from "classnames";
import { observer } from "mobx-react-lite";
import { UniswapV3Position } from "src/strategy/uniswap_v3";
import { Block } from "src/components/Block";
import {
  TextField,
  InputAdornment,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  Box,
} from "@mui/material";

export const UniswapV3PositionControl = observer(
  (props: { position: UniswapV3Position; className?: string }) => {
    return (
      <Block className={cn("flex flex-col gap-4", props.className)}>
        <div className="flex items-center justify-between">
          <Typography variant="h6">Uniswap v3</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={props.position.enabled}
                onChange={(e) => {
                  props.position.enabled = e.target.checked;
                }}
              />
            }
            label="Enabled"
          />
        </div>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Lower Price"
              type="number"
              InputProps={{
                inputProps: { step: 10 },
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
                inputProps: { step: 10 },
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
                inputProps: { step: 10 },
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
                inputProps: { step: 100 },
              }}
              size="small"
              fullWidth
              value={props.position.initialPositionValueInToken1}
              onChange={(e) => {
                props.position.initialPositionValueInToken1 = Number(
                  e.target.value,
                );
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="APR %"
              type="number"
              InputProps={{
                inputProps: { step: 1 },
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
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
        <Box mt={2}>
          <Grid container gap={2}>
            <Grid item xs={12} sm={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={props.position.isCustomTokenDistribution}
                    onChange={(e) => {
                      props.position.isCustomTokenDistribution =
                        e.target.checked;
                    }}
                  />
                }
                label="Custom Token Distribution"
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
                    max: 1,
                  },
                }}
                size="small"
                fullWidth
                disabled={!props.position.isCustomTokenDistribution}
                value={props.position.t0Part}
                onChange={(e) => {
                  props.position.setCustomTokenDistribution(
                    Number(e.target.value),
                  );
                }}
              />
            </Grid>
            <Grid item>
              <Box>
                <Typography
                  variant="body2"
                  color={
                    props.position.isCustomTokenDistribution
                      ? "text.primary"
                      : "text.disabled"
                  }
                >
                  Token0:{" "}
                  {(
                    (props.position.initialPositionValueInToken1 *
                      props.position.t0Part) /
                    props.position.initialPriceInToken1
                  ).toFixed(4)}{" "}
                  ({props.position.t0Part * 100}%)
                </Typography>
                <Typography
                  variant="body2"
                  color={
                    props.position.isCustomTokenDistribution
                      ? "text.primary"
                      : "text.disabled"
                  }
                >
                  Token1:{" "}
                  {(
                    props.position.initialPositionValueInToken1 *
                    (1 - props.position.t0Part)
                  ).toFixed(4)}{" "}
                  ({(1 - props.position.t0Part) * 100}%)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box mt={2}>
          <Typography variant="subtitle1" mb={0.5}>
            Initial Token Amounts:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body1" fontWeight="medium">
                Token0: {props.position.initialTokenAmounts[0].toFixed(4)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(
                  ((props.position.initialTokenAmounts[0] *
                    props.position.initialPriceInToken1) /
                    props.position.initialPositionValueInToken1) *
                  100
                ).toFixed(2)}
                %
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" fontWeight="medium">
                Token1: {props.position.initialTokenAmounts[1].toFixed(4)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(
                  (props.position.initialTokenAmounts[1] /
                    props.position.initialPositionValueInToken1) *
                  100
                ).toFixed(2)}
                %
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Block>
    );
  },
);
