import cn from "classnames";
import { observer } from "mobx-react-lite";
import { OptionPosition, OptionType, PositionType } from "src/strategy/options";
import { Block } from "src/components/Block";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Grid,
  Typography,
  Switch,
} from "@mui/material";

export const OptionPositionControl = observer(
  (props: {
    option: OptionPosition;
    className?: string;
    onRemove: () => void;
  }) => {
    return (
      <Block
        className={cn(
          "flex flex-col gap-4",
          props.className,
          !props.option.enabled && "opacity-50",
        )}
      >
        <div className="flex items-center gap-4">
          <Typography variant="h6">Option</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="option-type-label">Type</InputLabel>
            <Select
              labelId="option-type-label"
              value={props.option.optionType}
              label="Type"
              onChange={(e) => {
                props.option.optionType = e.target.value as OptionType;
              }}
            >
              <MenuItem value={OptionType.CALL}>{OptionType.CALL}</MenuItem>
              <MenuItem value={OptionType.PUT}>{OptionType.PUT}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="position-type-label">Position</InputLabel>
            <Select
              labelId="position-type-label"
              value={props.option.position}
              label="Position"
              onChange={(e) => {
                props.option.position = e.target.value as PositionType;
              }}
            >
              <MenuItem value={PositionType.BUY}>{PositionType.BUY}</MenuItem>
              <MenuItem value={PositionType.SELL}>{PositionType.SELL}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Spot Price"
            type="number"
            InputProps={{
              inputProps: { step: 0.5 },
            }}
            size="small"
            sx={{ minWidth: 120 }}
            value={props.option.spotPrice}
            onChange={(e) => {
              props.option.spotPrice = Number(e.target.value);
            }}
          />
          <Typography variant="body2" sx={{ minWidth: 100 }}>
            IV: {(props.option.IV * 100).toFixed(1)}%
          </Typography>
          <div className="flex-grow" />
          <div className="flex items-center gap-2">
            <Switch
              checked={props.option.enabled}
              onChange={(e) => {
                props.option.enabled = e.target.checked;
              }}
            />
            <button
              onClick={props.onRemove}
              className="cursor-pointer rounded bg-red-500 px-2 py-1 text-sm text-white hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        </div>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Premium"
              type="number"
              InputProps={{
                inputProps: { step: 0.5 },
              }}
              size="small"
              fullWidth
              value={props.option.premium_per_item}
              onChange={(e) => {
                props.option.premium_per_item = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Quantity"
              type="number"
              InputProps={{
                inputProps: { step: 0.5 },
              }}
              size="small"
              fullWidth
              value={props.option.quantity}
              onChange={(e) => {
                props.option.quantity = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Strike"
              type="number"
              InputProps={{
                inputProps: { step: 0.5 },
              }}
              size="small"
              fullWidth
              value={props.option.strike_price}
              onChange={(e) => {
                props.option.strike_price = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Expiration (days)"
              type="number"
              InputProps={{
                inputProps: {
                  step: 1,
                  min: 1,
                },
              }}
              size="small"
              fullWidth
              value={props.option.expirationDays}
              onChange={(e) => {
                props.option.expirationDays = Math.max(
                  1,
                  Number(e.target.value),
                );
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2} className={"flex"}>
            <div className={"flex-1"}></div>
            <div className={"ml-auto w-full flex-1 flex-col items-end gap-2"}>
              <Typography variant="body2">AutoRoll</Typography>
              <Switch
                size="small"
                checked={props.option.autoRoll}
                onChange={(e) => {
                  props.option.autoRoll = e.target.checked;
                }}
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Auto roll days"
              type="number"
              disabled={!props.option.autoRoll}
              InputProps={{
                inputProps: {
                  step: 1,
                  min: 1,
                },
              }}
              size="small"
              fullWidth
              value={props.option.autoRollDays}
              onChange={(e) => {
                props.option.autoRollDays = Number(e.target.value);
              }}
            />
          </Grid>
        </Grid>
      </Block>
    );
  },
);
