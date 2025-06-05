import cn from "classnames";
import { observer } from "mobx-react-lite";
import { Strategy } from "src/strategy/strategy";
import { Block } from "src/components/Block";
import { TextField, InputAdornment, Typography, Grid } from "@mui/material";
import { computed } from "mobx";
import React from "react";

export const StrategySettingsControl = observer(
  (props: { strategy: Strategy; className?: string }) => {
    const [priceRangePercent, setPriceRangePercent] = React.useState(70);

    const updatePriceRange = (currentPrice: number) => {
      const range = currentPrice * (priceRangePercent / 100);
      props.strategy.minPrice = currentPrice - range;
      props.strategy.maxPrice = currentPrice + range;
    };

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
              value={props.strategy.daysInPosition || ''}
              onChange={(e) => {
                props.strategy.daysInPosition = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Current Market Price"
              type="number"
              InputProps={{
                inputProps: { step: 100 },
              }}
              size="small"
              fullWidth
              value={props.strategy.minPrice ? (props.strategy.minPrice + props.strategy.maxPrice) / 2 : ''}
              onChange={(e) => {
                const currentPrice = Number(e.target.value);
                updatePriceRange(currentPrice);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Price Range"
              type="number"
              InputProps={{
                inputProps: { step: 5, min: 1, max: 100 },
                endAdornment: (
                  <InputAdornment position="end">%</InputAdornment>
                ),
              }}
              size="small"
              fullWidth
              value={priceRangePercent}
              onChange={(e) => {
                const newRange = Number(e.target.value);
                setPriceRangePercent(newRange);
                if (props.strategy.minPrice && props.strategy.maxPrice) {
                  const currentPrice = (props.strategy.minPrice + props.strategy.maxPrice) / 2;
                  updatePriceRange(currentPrice);
                }
              }}
            />
          </Grid>
        </Grid>
      </Block>
    );
  },
);
