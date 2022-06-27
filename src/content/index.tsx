import React from 'react';
import ReactDOM from 'react-dom';
import YouTubePlayerButton from './components/YouTubePlayerButton/YouTubePlayerButton';
import { getURLQueryParams } from './util/url-queryparams';
import { storeVideoSnapshot } from './util/video-to-image';
import { createPdfFileFromImgFileHandles } from './util/images-to-pdf';
import { useSettingsStore } from '../store';

// issue: we need to inject the controls for the page in a certain place among the buttons of the YouTube Player
// so we insert a "injection container" for the container with the actual buttons next to one of the existing buttons
// it will be used by ReactDOM.render()
const container = document.createElement('span');
const subtitleButton = document.querySelector('.ytp-settings-button')!;
subtitleButton.before(container);

const video = document.querySelector('video')!;
const videoId = getURLQueryParams().v;
let dirHandle: FileSystemDirectoryHandle | null;

const ButtonContainer = () => {
  const [settings] = useSettingsStore();
  const { enableOCR } = settings;

  const screenshotHandler = async () => {
    if (!dirHandle) {
      video.pause();
      dirHandle = await window.showDirectoryPicker();
    }
    const newFileHandle = await dirHandle.getFileHandle(
      `${videoId}_${video.currentTime.toFixed(0).padStart(5, '0')}.png`, // pad to make sure we can use alphabetical sorting to sort the files by timestamp
      { create: true }
    );
    await storeVideoSnapshot(video, newFileHandle);
  };

  const pdfGenHandler = async () => {
    if (!dirHandle) {
      video.pause();
      dirHandle = await window.showDirectoryPicker();
    }

    const imgFileHandles: FileSystemFileHandle[] = [];

    for await (const entry of dirHandle.values()) {
      if (entry.kind == 'file' && entry.name.endsWith('.png')) {
        imgFileHandles.push(await dirHandle.getFileHandle(entry.name));
      }
    }
    imgFileHandles.sort((a, b) => a.name.localeCompare(b.name));

    const pdfFileName =
      document
        .querySelector('h1.ytd-watch-metadata') // video title element
        ?.textContent?.trim()
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/ /g, '_') || 'imgs_to_slides';

    await createPdfFileFromImgFileHandles(
      `${pdfFileName}.pdf`,
      dirHandle,
      imgFileHandles,
      enableOCR
    );
  };

  return (
    <>
      <YouTubePlayerButton label="Screenshot" onClick={screenshotHandler} />
      <YouTubePlayerButton label="PDF" onClick={pdfGenHandler} />
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <ButtonContainer />
  </React.StrictMode>,
  container
);
