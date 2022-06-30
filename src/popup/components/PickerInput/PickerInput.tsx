import { Button, SxProps, TextField, Theme } from '@mui/material';
import React from 'react';

type PickerInputProps = {
  buttonLabel: string;
  value: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  helperText?: string;
  sx?: SxProps<Theme>;
};

const PickerInput = (props: PickerInputProps) => {
  return (
    <TextField
      sx={props.sx}
      value={props.value}
      variant="outlined"
      helperText={props.helperText}
      InputProps={{
        endAdornment: (
          <Button onClick={props.onClick} color="primary" variant="contained">
            {props.buttonLabel}
          </Button>
        ),
        readOnly: true,
      }}
    />
  );
};

export default PickerInput;
