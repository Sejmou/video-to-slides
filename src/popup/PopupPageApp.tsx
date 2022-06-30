import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './popup.module.css';
import {
  FormGroup,
  Card,
  Typography,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { Settings, useSettingsStore } from '../shared/store';
import {
  addMessageListener,
  isDirectoryChange,
  MessageTypes,
  sendMessageToContentScript,
} from '../shared/script-communication';
import { red } from '@mui/material/colors';
import SwitchInput from './components/SwitchInput/SwitchInput';
import PickerInput from './components/PickerInput/PickerInput';
import KeyboardShortcutPicker from './components/KeyboardShortcutPicker/KeyboardShortcutPicker';
import {
  KeyComboKeys,
  keyComboKeysAsString,
} from '../shared/keyboard-shortcuts';

const theme = createTheme({
  palette: {
    primary: red,
  },
});

const Popup = () => {
  const [settingsAny, setSettingsAny, isPersistent, error] = useSettingsStore();
  // TODO: figure out smarter solution for typing
  const settings = settingsAny as Settings;
  const setSettings = setSettingsAny as React.Dispatch<
    React.SetStateAction<Settings>
  >;
  const [dirName, setdirName] = useState<string>('');

  // Create the subscription to directoryChangeResponseStream on component mount, not on every render.
  useEffect(() => {
    addMessageListener(message => {
      if (isDirectoryChange(message)) {
        setdirName(() => message.dirName);
      }
    });
    sendMessageToContentScript({ type: MessageTypes.currentDirectoryQuery });
  }, []);

  // const onChangeDirectoryClick = () => sendDirectoryChangeRequest();
  const onChangeDirectoryClick = () =>
    sendMessageToContentScript({ type: MessageTypes.directoryChangeRequest });

  // TODO: figure out smarter way to solve this with TypeScript support
  const handleChange = (propName: string, value: any) => {
    setSettingsAny((prevState: any) => {
      return {
        ...prevState,
        [propName]: value,
      };
    });
  };

  // TODO: fix this mess
  const screenShotShortcutPicker = keyComboKeysToShortcutPicker(
    'take screenshot of video',
    settings.screenshotKeyComboKeys,
    screenshotKeyComboKeys => {
      console.log(screenshotKeyComboKeys);
      if (screenshotKeyComboKeys.code === 'Escape') {
        // Escape means that setting new keyboard shortcut was aborted!
        return;
      }
      setSettings(() => ({
        ...settings,
        screenshotKeyComboKeys,
      }));
      sendMessageToContentScript({
        type: MessageTypes.shortcutUpdate,
        shortcuts: {
          createPdfKeyComboKeys: settings.createPdfKeyComboKeys,
          screenshotKeyComboKeys,
          changeSaveDirectoryKeyComboKeys:
            settings.changeSaveDirectoryKeyComboKeys,
        },
      });
    }
  );
  const createPdfShortcutPicker = keyComboKeysToShortcutPicker(
    'create PDF from images in current directory',
    settings.createPdfKeyComboKeys,
    createPdfKeyComboKeys => {
      console.log(createPdfKeyComboKeys);
      if (createPdfKeyComboKeys.code === 'Escape') {
        // Escape means that setting new keyboard shortcut was aborted!
        return;
      }
      setSettings(() => ({
        ...settings,
        createPdfKeyComboKeys,
      }));
      sendMessageToContentScript({
        type: MessageTypes.shortcutUpdate,
        shortcuts: {
          createPdfKeyComboKeys,
          screenshotKeyComboKeys: settings.screenshotKeyComboKeys,
          changeSaveDirectoryKeyComboKeys:
            settings.changeSaveDirectoryKeyComboKeys,
        },
      });
    }
  );
  const changeCurrentDirShortcutPicker = keyComboKeysToShortcutPicker(
    'Change current directory',
    settings.changeSaveDirectoryKeyComboKeys,
    changeSaveDirectoryKeyComboKeys => {
      console.log(changeSaveDirectoryKeyComboKeys);
      if (changeSaveDirectoryKeyComboKeys.code === 'Escape') {
        // Escape means that setting new keyboard shortcut was aborted!
        return;
      }
      setSettings(() => ({
        ...settings,
        changeSaveDirectoryKeyComboKeys,
      }));
      sendMessageToContentScript({
        type: MessageTypes.shortcutUpdate,
        shortcuts: {
          createPdfKeyComboKeys: settings.createPdfKeyComboKeys,
          screenshotKeyComboKeys: settings.screenshotKeyComboKeys,
          changeSaveDirectoryKeyComboKeys,
        },
      });
    }
  );
  const keyComboPickers = [
    screenShotShortcutPicker,
    createPdfShortcutPicker,
    changeCurrentDirShortcutPicker,
  ];

  return (
    <ThemeProvider theme={theme}>
      <div className={styles['popup-container']}>
        <div className={styles['heading-container']}>
          <img src="icons/icon32.png" alt="Video to Slides Icon" />
          <Typography variant="h4">Video to Slides Config</Typography>
        </div>

        <FormGroup className={styles['form-group']}>
          <Card className={styles.card}>
            <Typography variant="h5">Directory</Typography>
            <PickerInput
              value={dirName ? dirName : 'Not selected'}
              buttonLabel={dirName ? 'Change' : 'Select'}
              helperText="The directory used for storing screenshots and PDF generation"
              onClick={onChangeDirectoryClick}
            />
          </Card>
          <Card className={styles.card}>
            <Typography variant="h5">PDF generation</Typography>
            <SwitchInput
              checked={settingsAny.enableOCR}
              onChange={ev => handleChange('enableOCR', ev.target.checked)}
              tooltipText="PDF generation may take significantly longer"
              helperText="Detect text in video screenshots (makes PDF searchable)"
              label="text recognition"
            />
          </Card>
          <Card className={styles.card}>
            <Typography variant="h5">Keyboard Shortcuts</Typography>
            <div className={styles['shortcut-picker-container']}>
              {keyComboPickers}
            </div>
          </Card>
        </FormGroup>
      </div>
    </ThemeProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById('root')
);

function keyComboKeysToShortcutPicker(
  keyComboDesc: string,
  keyComboKeys: KeyComboKeys,
  onNewKeyComboKeys: (keyComboKeys: KeyComboKeys) => void
) {
  const keyComboKeysStr = keyComboKeysAsString(keyComboKeys);
  return (
    <KeyboardShortcutPicker
      key={keyComboDesc + keyComboKeysStr}
      buttonLabel={'Change'}
      shortcutCombination={keyComboKeysStr}
      onNewKeyComboKeys={onNewKeyComboKeys}
      shortcutDescription={keyComboDesc}
    />
  );
}
