import cn from "classnames";
import { observer } from "mobx-react-lite";
import { OptionPosition, OptionType, PositionType } from "src/strategy/options";
import { Block } from "src/components/Block";
import { 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  FormLabel, 
  TextField, 
  Grid
} from "@mui/material";

export const OptionPositionControl = observer(
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
