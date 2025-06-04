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
  Switch
} from "@mui/material";

export const OptionPositionControl = observer(
  (props: { option: OptionPosition; className?: string; onRemove: () => void }) => {
    return (
      <Block className={cn(
        "flex flex-col gap-4",
        props.className,
        !props.option.enabled && "opacity-50"
      )}>
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
              className="px-2 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        </div>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Price"
              type="number"
              InputProps={{
                inputProps: { step: 0.5 }
              }}
              size="small"
              fullWidth
              value={props.option.premium_per_item}
              onChange={(e) => {
                props.option.premium_per_item = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Quantity"
              type="number"
              InputProps={{
                inputProps: { step: 0.5 }
              }}
              size="small"
              fullWidth
              value={props.option.quantity}
              onChange={(e) => {
                props.option.quantity = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Strike"
              type="number"
              InputProps={{
                inputProps: { step: 0.5 }
              }}
              size="small"
              fullWidth
              value={props.option.strike_price}
              onChange={(e) => {
                props.option.strike_price = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Expiration (days)"
              type="number"
              InputProps={{
                inputProps: { 
                  step: 1,
                  min: 1
                }
              }}
              size="small"
              fullWidth
              value={props.option.expirationDays}
              onChange={(e) => {
                props.option.expirationDays = Math.max(1, Number(e.target.value));
              }}
            />
          </Grid>
        </Grid>
      </Block>
    );
  },
);
