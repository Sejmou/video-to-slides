import React from 'react';
import ReactDOM from 'react-dom';
import YouTubePlayerButton from './components/Button/YouTubePlayerButton';
import { getURLQueryParams } from './util/url-queryparams';
import { storeVideoSnapshot } from './util/video-to-image';
import { createPdfFileFromImgFileHandles } from './util/images-to-pdf';
import { createOcrPdf } from './util/ocr';

const container = document.createElement('span');
const subtitleButton = document.querySelector('.ytp-settings-button')!;
subtitleButton.before(container);

const video = document.querySelector('video')!;

const videoId = getURLQueryParams().v;

let dirHandle: FileSystemDirectoryHandle | null;

const clickHandler = async () => {
  if (!dirHandle) {
    video.pause();
    dirHandle = await window.showDirectoryPicker();
  } else {
    const newFileHandle = await dirHandle.getFileHandle(
      `${videoId}_${video.currentTime.toFixed(0).padStart(5, '0')}.png`, // pad to make sure we can use alphabetical sorting to sort the files by timestamp
      { create: true }
    );
    await storeVideoSnapshot(video, newFileHandle);
  }
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

  const pdfFileHandle = await createPdfFileFromImgFileHandles(
    `${pdfFileName}.pdf`,
    dirHandle,
    imgFileHandles
  );

  await createOcrPdf(pdfFileHandle, dirHandle);
};

ReactDOM.render(
  <React.StrictMode>
    <YouTubePlayerButton label="Screenshot" onClick={clickHandler} />
    <YouTubePlayerButton label="PDF" onClick={pdfGenHandler} />
  </React.StrictMode>,
  container
);
