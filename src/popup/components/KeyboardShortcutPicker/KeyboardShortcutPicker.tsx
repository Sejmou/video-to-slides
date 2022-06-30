import { FormLabel, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { KeyComboKeys } from '../../../shared/keyboard-shortcuts';
import PickerInput from '../PickerInput/PickerInput';
import { KeyComboDetector } from './keycombo-detection';

export type KeyboardShortcutPickerProps = {
  shortcutDescription: string;
  buttonLabel: string;
  shortcutCombination: string;
  onNewKeyComboKeys: (keyComboKeys: KeyComboKeys) => void;
};

// TODO: try to come up with smarter solution for this
const keyComboDetectors: KeyComboDetector[] = [];

const KeyboardShortcutPicker = (props: KeyboardShortcutPickerProps) => {
  // TODO: try to come up with smarter solution for this
  const [keyComboDetectorIdx, setKeyComboDetectorIdx] = useState(-1);

  const [keyComboChangeInProgress, setkeyComboChangeInProgress] =
    useState(false);

  const keyComboDetector: KeyComboDetector | undefined =
    keyComboDetectors[keyComboDetectorIdx];
  useEffect(() => {
    const arrLength = keyComboDetectors.push(new KeyComboDetector());
    setKeyComboDetectorIdx(() => arrLength - 1);
  }, []);

  const onChangeShortcutComboClick = async () => {
    if (keyComboDetector) {
      setkeyComboChangeInProgress(() => true);
      const newKeyCombo = await keyComboDetector.detectNewKeyboardCombination();
      props.onNewKeyComboKeys(newKeyCombo);
      setkeyComboChangeInProgress(() => false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <FormLabel>{props.shortcutDescription}</FormLabel>
      <PickerInput
        sx={{ width: '100%' }}
        buttonLabel={props.buttonLabel}
        value={
          keyComboChangeInProgress
            ? 'Waiting for new input'
            : props.shortcutCombination
        }
        onClick={onChangeShortcutComboClick}
      />
    </Box>
  );
};

export default KeyboardShortcutPicker;
