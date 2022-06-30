import { Button, TextField } from '@mui/material';
import React from 'react';

type Props = {
  buttonLabel: string;
  value: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  helperText?: string;
};

const PickerInput = (props: Props) => {
  return (
    <TextField
      value={props.value}
      variant="outlined"
      helperText={props.helperText}
      InputProps={{
        endAdornment: (
          <Button onClick={props.onClick} variant="contained">
            {props.buttonLabel}
          </Button>
        ),
        readOnly: true,
      }}
    />
  );
};

export default PickerInput;
