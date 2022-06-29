import React from 'react';
import {
  IconButton,
  Snackbar,
  SnackbarCloseReason,
  SnackbarContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';
export interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertSeverity;
  autoHideDuration?: number;
}

export const InfoSnackbar = (props: {
  snackbarState: SnackbarState;
  onClose: (
    // TODO: check some day how to properly type such things
    event: Event | React.SyntheticEvent<any, Event>,
    reason?: SnackbarCloseReason
  ) => void;
}) => {
  const { snackbarState, onClose: onSnackbarClose } = props;

  const snackbarAction = (
    <>
      <IconButton
        aria-label="close"
        color="inherit"
        size="medium"
        onClick={onSnackbarClose}
      >
        <CloseIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </>
  );

  return (
    <Snackbar
      open={snackbarState.open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={snackbarState.autoHideDuration || 4000}
      onClose={onSnackbarClose}
    >
      <SnackbarContent
        message={snackbarState.message}
        sx={{ fontSize: 14 }}
        action={snackbarAction}
      />
    </Snackbar>
  );
};
