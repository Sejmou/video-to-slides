import React, { MouseEventHandler } from 'react';
import { createPortal } from 'react-dom';
import styles from './YouTubePlayerButton.module.css';

type YouTubePlayerButtonProps = { onClick: MouseEventHandler; label: string };

// issue: we need to inject each button for the page in a certain place among the buttons of the YouTube Player
// so we insert a "injection container" for the container with the actual buttons next to one of the existing buttons
// it will be used by ReactDOM.render()
const container = document.createElement('span');
const subtitleButton = document.querySelector('.ytp-settings-button')!;
subtitleButton.before(container);

function YouTubePlayerButton(props: YouTubePlayerButtonProps) {
  return createPortal(
    <button
      id="test"
      className={`ytp-button ${styles.btn}`}
      onClick={props.onClick}
    >
      <span>{props.label}</span>
    </button>,
    container
  );
}

export default YouTubePlayerButton;
