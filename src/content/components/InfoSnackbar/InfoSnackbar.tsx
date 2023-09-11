import React from 'react';
import {
  Button,
  IconButton,
  Snackbar,
  SnackbarCloseReason,
  SnackbarContent,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';
export type SnackbarState = {
  open: boolean;
  message: string;
  severity: AlertSeverity;
  autoHideDuration?: number;
  relatedAction?: {
    label: string;
    callback: () => void;
  };
};

export const InfoSnackbar = (props: {
  snackbarState: SnackbarState;
  onClose: (
    // TODO: check some day how to properly type such things
    event: Event | React.SyntheticEvent<any, Event>,
    reason?: SnackbarCloseReason
  ) => void;
}) => {
  const { snackbarState, onClose: onSnackbarClose } = props;
  const relatedAction = snackbarState.relatedAction;

  const snackbarAction = (
    <>
      {!!relatedAction && (
        <Button
          color="secondary"
          size="medium"
          onClick={relatedAction.callback}
        >
          {relatedAction.label}
        </Button>
      )}
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
