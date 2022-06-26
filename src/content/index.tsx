import React from 'react';
import ReactDOM from 'react-dom';
import YouTubePlayerButton from './components/Button/YouTubePlayerButton';
import { jsPDF } from 'jspdf';

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

function getURLQueryParams() {
  return new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop as string),
  }) as any; // quick fix to be able to use type safety here
}

const videoId = getURLQueryParams().v;

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

async function fileToDataUrl(file: File) {
  return new Promise<string>(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

const clickHandler = async () => {
  if (!dirHandle) {
    video.pause();
    dirHandle = await window.showDirectoryPicker();
  } else {
    const newFileHandle = await dirHandle.getFileHandle(
      `${videoId}_${video.currentTime.toFixed(0).padStart(5, '0')}.png`, // pad to make sure we can use alphabetical sorting to sort the files by timestamp
      { create: true }
    );
    await storeVideoSnapshot(canvas, video, newFileHandle);
  }
};

const pdfGenHandler = async () => {
  if (!dirHandle) {
    video.pause();
    dirHandle = await window.showDirectoryPicker();
  }

  // adapted from https://javascript.plainenglish.io/generating-pdf-from-images-on-the-client-side-with-react-a971b61de28c

  // Default export is A4 paper, portrait, using millimeters for units.
  const doc = new jsPDF({ orientation: 'landscape' });

  // We let the images add all pages,
  // therefore the first default page can be removed.
  doc.deletePage(1);

  const pngFileNames: string[] = [];

  for await (const entry of dirHandle.values()) {
    //console.log(entry.kind, entry.name);
    if (entry.kind == 'file' && entry.name.endsWith('.png')) {
      pngFileNames.push(entry.name);
    }
  }
  pngFileNames.sort();

  pngFileNames.forEach(async fileName => {
    doc.addPage([canvas.height, canvas.width], 'landscape');
    const imgFileHandle = await dirHandle?.getFileHandle(fileName);
    if (!imgFileHandle) {
      console.warn('could not get file handle for file name', fileName);
      return;
    }
    const imgFile = await imgFileHandle.getFile();
    const imgDataUrl = await fileToDataUrl(imgFile);
    const img = document.createElement('img');
    img.src = imgDataUrl;
    doc.addImage({
      imageData: img,
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
    });
  });

  const pdfBlob = doc.output('blob');
  const pdfFileName =
    document
      .querySelector('h1.ytd-watch-metadata') // video title element
      ?.textContent?.trim()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/ /, '_') || 'imgs_to_slides';
  const pdfFileHandle = await dirHandle.getFileHandle(`${pdfFileName}.pdf`, {
    create: true,
  });
  const writableStream = await pdfFileHandle.createWritable();
  await writableStream.write(pdfBlob);
  await writableStream.close();
};

ReactDOM.render(
  <React.StrictMode>
    <YouTubePlayerButton label="Screenshot" onClick={clickHandler} />
    <YouTubePlayerButton label="PDF" onClick={pdfGenHandler} />
  </React.StrictMode>,
  container
);

// console.log(tempContainer.children);
