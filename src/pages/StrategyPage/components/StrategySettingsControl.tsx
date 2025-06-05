import cn from "classnames";
import { observer } from "mobx-react-lite";
import { Strategy } from "src/strategy/strategy";
import { Block } from "src/components/Block";
import { Grid, InputAdornment, TextField, Typography } from "@mui/material";
import React from "react";

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
              value={props.strategy.daysInPosition || ""}
              onChange={(e) => {
                props.strategy.daysInPosition = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Current Spot Price"
              type="number"
              InputProps={{
                inputProps: { step: 100 },
              }}
              size="small"
              fullWidth
              value={
                props.strategy.minPrice
                  ? (props.strategy.minPrice + props.strategy.maxPrice) / 2
                  : ""
              }
              onChange={(e) => {
                props.strategy.spotPrice = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Price Range"
              type="number"
              InputProps={{
                inputProps: { step: 5, min: 1, max: 100 },
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              size="small"
              fullWidth
              value={props.strategy.priceRangePercent || ""}
              onChange={(e) => {
                props.strategy.priceRangePercent = Number(e.target.value);
              }}
            />
          </Grid>
        </Grid>
      </Block>
    );
  },
);
