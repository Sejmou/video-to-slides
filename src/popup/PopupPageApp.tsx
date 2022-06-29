import React from 'react';
import ReactDOM from 'react-dom';
import styles from './popup.module.css';
import {
  Switch,
  FormControlLabel,
  FormLabel,
  FormGroup,
  Tooltip,
} from '@mui/material';
import { useSettingsStore } from '../store';

const Popup = () => {
  const [settings, setSettings, isPersistent, error] = useSettingsStore();
  console.log('settings', settings);

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
      <h1 className={styles.heading}>Video to Slides Config</h1>
      <FormGroup className={styles.formgroup}>
        <FormLabel>PDF generation</FormLabel>
        <Tooltip
          enterDelay={700}
          enterNextDelay={700}
          title="Detects text in video screenshots and makes PDF searchable - PDF generation may take significantly longer"
        >
          <FormControlLabel
            control={
              <Switch
                checked={settings.enableOCR}
                onChange={ev => handleChange('enableOCR', ev.target.checked)}
              />
            }
            label="text recogniction"
          />
        </Tooltip>
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
