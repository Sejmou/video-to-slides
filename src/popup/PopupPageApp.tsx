import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './popup.module.css';
import {
  Switch,
  FormControlLabel,
  FormGroup,
  Tooltip,
  Button,
  FormHelperText,
  TextField,
  FormControl,
  Card,
  Typography,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { useSettingsStore } from '../shared/store';
import {
  addMessageListener,
  isDirectoryChange,
  MessageTypes,
  sendMessageToContentScript,
} from '../shared/script-communication';
import { red } from '@mui/material/colors';
import SwitchInput from './components/SwitchInput/SwitchInput';
import PickerInput from './components/PickerInput/PickerInput';

const theme = createTheme({
  palette: {
    primary: red,
  },
});

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
              checked={settings.enableOCR}
              onChange={ev => handleChange('enableOCR', ev.target.checked)}
              tooltipText="PDF generation may take significantly longer"
              helperText="Detect text in video screenshots (makes PDF searchable)"
              label="text recognition"
            />
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
