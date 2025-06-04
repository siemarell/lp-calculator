import cn from "classnames";
import { observer } from "mobx-react-lite";
import { FuturePosition, FutureType } from "src/strategy/futures";
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
  InputAdornment,
} from "@mui/material";

export const FuturePositionControl = observer(
  (props: { position: FuturePosition; className?: string }) => {
    return (
      <Block className={cn(
        "flex flex-col gap-4",
        props.className,
        !props.position.enabled && "opacity-50"
      )}>
        <div className="flex items-center gap-4">
          <Typography variant="h6">Future</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="future-type-label">Type</InputLabel>
            <Select
              labelId="future-type-label"
              value={props.position.futureType}
              label="Type"
              onChange={(e) => {
                props.position.futureType = e.target.value as FutureType;
              }}
            >
              <MenuItem value={FutureType.LONG}>Long</MenuItem>
              <MenuItem value={FutureType.SHORT}>Short</MenuItem>
            </Select>
          </FormControl>
          <div className="flex-grow" />
          <Switch
            checked={props.position.enabled}
            onChange={(e) => {
              props.position.enabled = e.target.checked;
            }}
          />
        </div>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Amount"
              type="number"
              InputProps={{
                inputProps: { step: 0.1 }
              }}
              size="small"
              fullWidth
              value={props.position.amount}
              onChange={(e) => {
                props.position.amount = Number(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Margin"
              type="number"
              InputProps={{
                inputProps: { step: 1, min: 0, max: 100 },
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              size="small"
              fullWidth
              value={props.position.margin}
              onChange={(e) => {
                props.position.margin = Number(e.target.value);
              }}
            />
          </Grid>
        </Grid>
      </Block>
    );
  },
); 