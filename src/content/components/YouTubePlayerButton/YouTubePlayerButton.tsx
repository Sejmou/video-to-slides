import React, { MouseEventHandler } from 'react';
import styles from './YouTubePlayerButton.module.css';

type Props = { onClick: MouseEventHandler; label: string };

function YouTubePlayerButton(props: Props) {
  return (
    <button
      id="test"
      className={`ytp-button ${styles.btn}`}
      onClick={props.onClick}
    >
      <span>{props.label}</span>
    </button>
  );
}

export default YouTubePlayerButton;
