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
  Typography
} from "@mui/material";

export const OptionPositionControl = observer(
  (props: { option: OptionPosition; className?: string }) => {
    return (
      <Block className={cn("flex flex-col gap-4", props.className)}>
        <Typography variant="h6">Option</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="option-type-label">Option Type</InputLabel>
              <Select
                labelId="option-type-label"
                value={props.option.optionType}
                label="Option Type"
                onChange={(e) => {
                  props.option.optionType = e.target.value as OptionType;
                }}
              >
                <MenuItem value={OptionType.CALL}>{OptionType.CALL}</MenuItem>
                <MenuItem value={OptionType.PUT}>{OptionType.PUT}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="position-type-label">Position Type</InputLabel>
              <Select
                labelId="position-type-label"
                value={props.option.position}
                label="Position Type"
                onChange={(e) => {
                  props.option.position = e.target.value as PositionType;
                }}
              >
                <MenuItem value={PositionType.BUY}>{PositionType.BUY}</MenuItem>
                <MenuItem value={PositionType.SELL}>{PositionType.SELL}</MenuItem>
              </Select>
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
