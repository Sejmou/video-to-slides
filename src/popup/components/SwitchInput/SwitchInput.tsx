import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Switch,
  Tooltip,
} from '@mui/material';
import React from 'react';

type Props = {
  checked: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
  tooltipText?: string;
  helperText?: string;
  label: string;
};

const SwitchInput = (props: Props) => {
  const formControl = (
    <FormControl>
      <FormControlLabel
        control={<Switch checked={props.checked} onChange={props.onChange} />}
        label={props.label}
      />
      {props.helperText && <FormHelperText>{props.helperText}</FormHelperText>}
    </FormControl>
  );

  if (props.tooltipText) {
    return (
      <Tooltip enterDelay={700} enterNextDelay={700} title={props.tooltipText}>
        {formControl}
      </Tooltip>
    );
  }

  return formControl;
};

export default SwitchInput;
