import React, { useState } from 'react';
import ReactDOM, { createPortal } from 'react-dom';
import YouTubePlayerButton from './components/YouTubePlayerButton/YouTubePlayerButton';
import { getURLQueryParams } from './util/url-queryparams';
import { storeVideoSnapshot } from './util/video-to-image';
import { createPdfFileFromImgFileHandles } from './util/images-to-pdf';
import { useSettingsStore } from '../store';
import { Snackbar, SnackbarContent } from '@mui/material';

// issue: we need to inject the controls for the page in a certain place among the buttons of the YouTube Player
// so we insert a "injection container" for the container with the actual buttons next to one of the existing buttons
// it will be used by ReactDOM.render()
const container = document.createElement('span');
const subtitleButton = document.querySelector('.ytp-settings-button')!;
subtitleButton.before(container);

const snackbarContainerPortal = document.createElement('div');
document.body.appendChild(snackbarContainerPortal);

type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
};

// the only reason this component is needed is that unnecessary styles would be applied on the Snackbar if it would be rendered without a portal
// for instance, when used inside the ButtonContainer, styles from the YouTube player controlrs would also be applied
// this caused the Snackbar to disappear as well whenever the player controls were hidden
const SnackbarContainer = (props: { snackbarState: SnackbarState }) => {
  const { snackbarState } = props;

  return createPortal(
    <Snackbar
      open={snackbarState.open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={5000}
    >
      <SnackbarContent message={snackbarState.message} sx={{ fontSize: 14 }} />
    </Snackbar>,
    snackbarContainerPortal
  );
};

const video = document.querySelector('video')!;
const videoId = getURLQueryParams().v;
let dirHandle: FileSystemDirectoryHandle | null;

const ButtonContainer = () => {
  const [settings] = useSettingsStore();
  const { enableOCR } = settings;

  const [snackbarState, setSnackbarState] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const dirAccess = async () => {
    if (!dirHandle) {
      video.pause();
      dirHandle = await window.showDirectoryPicker();
      return dirHandle;
    }
    return dirHandle;
  };

  const showMessage = (
    message: string,
    severity: 'error' | 'warning' | 'info' | 'success'
  ) =>
    setSnackbarState(() => ({
      open: true,
      severity,
      message,
    }));

  const handleFileAccessErrors = (error: unknown, failedActionDesc: string) => {
    let reasonDesc = 'Something went wrong :/';
    if (error instanceof DOMException) {
      if (error.name === 'AbortError') {
        reasonDesc = 'Read permission required';
      } else if (error.name === 'NotAllowedError') {
        reasonDesc = 'Write permission required';
      }
    }
    {
      showMessage([failedActionDesc, reasonDesc].join(' - '), 'error');
    }
  };

  const screenshotHandler = async () => {
    try {
      const dirHandle = await dirAccess();

      const newFileHandle = await dirHandle.getFileHandle(
        `${videoId}_${video.currentTime.toFixed(0).padStart(5, '0')}.png`, // pad to make sure we can use alphabetical sorting to sort the files by timestamp
        { create: true }
      );

      await storeVideoSnapshot(video, newFileHandle);
      const message = `Screenshot saved to '${dirHandle.name}' as '${newFileHandle.name}'`;
      setSnackbarState(() => ({
        open: true,
        message,
        severity: 'success',
      }));
    } catch (error) {
      handleFileAccessErrors(error, 'Could not store screenshot');
    }
  };

  const pdfGenHandler = async () => {
    try {
      const dirHandle = await dirAccess();

      showMessage(
        `PDF generation started${
          enableOCR ? ' (OCR enabled, this might take a while)' : ''
        }...`,
        'info'
      );

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
        imgFileHandles,
        enableOCR
      );

      if (pdfFileHandle) {
        showMessage(
          `PDF successfully generated (stored in '${dirHandle.name}' as '${pdfFileHandle.name}')`,
          'success'
        );
      } else {
        showMessage(
          `Could not generate PDF from slide images in '${dirHandle.name}'`,
          'error'
        );
      }
    } catch (error) {
      handleFileAccessErrors(error, 'PDF generation failed');
    }
  };

  return (
    <>
      <SnackbarContainer snackbarState={snackbarState} />
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
