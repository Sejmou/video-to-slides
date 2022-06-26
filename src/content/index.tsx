import React from 'react';
import ReactDOM from 'react-dom';
import Button from './components/Button/Button';

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.color) {
    console.log('Receive color = ' + msg.color);
    document.body.style.backgroundColor = msg.color;
    sendResponse('Change color to ' + msg.color);
  } else {
    sendResponse('Color message is none.');
  }
});

const container = document.createElement('span');
const subtitleButton = document.querySelector('.ytp-settings-button')!;
subtitleButton.before(container);

const video = document.querySelector('video')!;

const canvas = document.createElement('canvas');
canvas.width = 1920;
canvas.height = 1080;

async function storeVideoSnapshot(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  fileHandle: FileSystemFileHandle
) {
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const snapshotBlob = await canvasToBlob(canvas);
  const writableStream = await fileHandle.createWritable();
  await writableStream.write(snapshotBlob!);
  await writableStream.close();
}

let dirHandle: FileSystemDirectoryHandle | null;

async function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>(resolve => {
    canvas.toBlob(resolve);
  });
}

const clickHandler = async () => {
  if (!dirHandle) {
    video.pause();
    dirHandle = await window.showDirectoryPicker();
  } else {
    const newFileHandle = await dirHandle.getFileHandle(
      `${video.currentTime.toFixed(0)}.png`,
      { create: true }
    );
    await storeVideoSnapshot(canvas, video, newFileHandle);
  }
};

ReactDOM.render(
  <React.StrictMode>
    <button
      id="test"
      className="ytp-button"
      style={{ minWidth: 'min-content' }}
      onClick={clickHandler}
    >
      <span style={{ float: 'left' }}>Screenshot</span>
    </button>
  </React.StrictMode>,
  container
);

// console.log(tempContainer.children);
