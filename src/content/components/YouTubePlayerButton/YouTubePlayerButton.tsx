import React, { MouseEventHandler } from 'react';
import { createPortal } from 'react-dom';
import styles from './YouTubePlayerButton.module.css';

type YouTubePlayerButtonProps = { onClick: MouseEventHandler; label: string };

// issue: we need to inject each button for the page in a certain place among the buttons of the YouTube Player
// so we insert a "portal container" for the container with the actual buttons next to one of the existing buttons
// it will be used by ReactDOM.render()
const portalContainer = document.createElement('span');

const containerAdded = tryToAddContainerToVideoPlayer();
if (!containerAdded) {
  const videoPageNavigationObserver = new MutationObserver((_, obs) => {
    if (location.href.includes('/watch')) {
      const containerAdded = tryToAddContainerToVideoPlayer();
      if (containerAdded) obs.disconnect();
    }
  });
  videoPageNavigationObserver.observe(document, {
    childList: true,
    subtree: true,
  });
}

function tryToAddContainerToVideoPlayer() {
  const subtitleButton = document.querySelector('.ytp-settings-button');
  if (!subtitleButton) return false;
  subtitleButton.before(portalContainer);
  console.log(
    '[Video to Slides] added container for YouTubePlayerButtons to video player'
  );
  return true;
}

function YouTubePlayerButton(props: YouTubePlayerButtonProps) {
  return createPortal(
    <button
      id="test"
      className={`ytp-button ${styles.btn}`}
      onClick={props.onClick}
    >
      <span>{props.label}</span>
    </button>,
    portalContainer
  );
}

export default YouTubePlayerButton;
