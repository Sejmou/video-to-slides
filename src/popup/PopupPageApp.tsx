import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './popup.module.css';
import {
  Switch,
  FormControlLabel,
  FormLabel,
  FormGroup,
  Tooltip,
  Button,
  FormHelperText,
  Box,
  TextField,
} from '@mui/material';
import { useSettingsStore } from '../shared/store';
import {
  addMessageListener,
  isDirectoryChange,
  MessageTypes,
  sendMessageToContentScript,
} from '../shared/script-communication';
// import {
//   sendDirectoryChangeRequest,
//   sendCurrentDirectoryRequest,
//   directoryChangeStream,
// } from '../script-messaging';

const Popup = () => {
  const [settings, setSettings, isPersistent, error] = useSettingsStore();
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

  // useEffect(() => {
  //   sendCurrentDirectoryRequest();
  // }, []);

  // const onChangeDirectoryClick = () => sendDirectoryChangeRequest();
  const onChangeDirectoryClick = () =>
    sendMessageToContentScript({ type: MessageTypes.directoryChangeRequest });

  // TODO: figure out smarter way to solve this with TypeScript support
  const handleChange = (propName: string, value: any) => {
    setSettings((prevState: any) => {
      return {
        ...prevState,
        [propName]: value,
      };
    });
  };

  return (
    <div className={styles['popup-container']}>
      <div className={styles['heading-container']}>
        <img src="icons/icon32.png" alt="Video to Slides Icon" />
        <h1>Video to Slides Config</h1>
      </div>

      <FormGroup className={styles['form-group']}>
        <FormLabel>Directory</FormLabel>
        <TextField
          defaultValue={dirName ? dirName : 'Not selected'}
          variant="outlined"
          helperText="The directory used for storing screenshots and PDF generation"
          InputProps={{
            endAdornment: (
              <Button
                onClick={onChangeDirectoryClick}
                variant="contained"
                sx={{ marginLeft: 10 }}
              >
                {dirName ? 'Change' : 'Select'}
              </Button>
            ),
            readOnly: true,
          }}
        />
        <FormLabel>PDF generation</FormLabel>
        <div>
          <Tooltip
            enterDelay={700}
            enterNextDelay={700}
            title="PDF generation may take significantly longer"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableOCR}
                  onChange={ev => handleChange('enableOCR', ev.target.checked)}
                />
              }
              label="text recognition"
            />
          </Tooltip>
          <Tooltip
            enterDelay={700}
            enterNextDelay={700}
            title="PDF generation may take significantly longer"
          >
            <FormHelperText>
              Detect text in video screenshots (makes PDF searchable)
            </FormHelperText>
          </Tooltip>
        </div>
      </FormGroup>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById('root')
);
