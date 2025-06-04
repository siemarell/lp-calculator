import cn from "classnames";
import { observer } from "mobx-react-lite";
import { Strategy } from "src/strategy/strategy";
import { Block } from "src/components/Block";
import { TextField, InputAdornment, Typography, Grid } from "@mui/material";

export const StrategySettingsControl = observer(
  (props: { strategy: Strategy; className?: string }) => {
    return (
      <Block className={cn("flex flex-col gap-4", props.className)}>
        <Typography variant="h6">Strategy Settings</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Days In Position"
              type="number"
              InputProps={{
                inputProps: { step: 1, min: 1 },
                endAdornment: (
                  <InputAdornment position="end">days</InputAdornment>
                ),
              }}
              size="small"
              fullWidth
              value={props.strategy.daysInPosition}
              onChange={(e) => {
                props.strategy.daysInPosition = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Chart Min Price"
              type="number"
              InputProps={{
                inputProps: { step: 100 },
              }}
              size="small"
              fullWidth
              value={props.strategy.minPrice}
              onChange={(e) => {
                props.strategy.minPrice = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Chart Max Price"
              type="number"
              InputProps={{
                inputProps: { step: 100 },
              }}
              size="small"
              fullWidth
              value={props.strategy.maxPrice}
              onChange={(e) => {
                props.strategy.maxPrice = Number(e.target.value);
              }}
            />
          </Grid>
        </Grid>
      </Block>
    );
  },
);
