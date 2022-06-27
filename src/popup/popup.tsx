import React from 'react';
import ReactDOM from 'react-dom';
import styles from './popup.module.css';

const Popup = () => {
  return (
    <div className={styles['popup-container']}>
      <h1>Video to Slides Config</h1>
      Coming soon
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById('root')
);
