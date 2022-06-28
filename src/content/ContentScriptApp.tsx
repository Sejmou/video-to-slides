import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import YouTubePlayerButton from './components/YouTubePlayerButton/YouTubePlayerButton';
import { getURLQueryParams } from './util/url-queryparams';
import { storeVideoSnapshot } from './util/video-to-image';
import { createPdfFileFromImgFileHandles } from './util/images-to-pdf';
import { useSettingsStore } from '../store';
import { IconButton, Snackbar, SnackbarContent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const appContainer = document.createElement('div');
document.body.appendChild(appContainer);

const video = document.querySelector('video')!;
const videoId = getURLQueryParams().v;
let dirHandle: FileSystemDirectoryHandle | null;

type AlertSeverity = 'error' | 'warning' | 'info' | 'success';
type SnackbarState = {
  open: boolean;
  message: string;
  severity: AlertSeverity;
};

const ContentPageApp = () => {
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

  const onScreenshotClick = async () => {
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

  const onPdfGenClick = async () => {
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

  const onSnackbarClose = () =>
    setSnackbarState(() => ({
      open: false,
      message: '',
      severity: 'info',
    }));

  const snackbarAction = (
    <>
      <IconButton
        aria-label="close"
        color="inherit"
        size="medium"
        onClick={onSnackbarClose}
      >
        <CloseIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </>
  );

  const showMessage = (message: string, severity: AlertSeverity) =>
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

  return (
    <>
      <Snackbar
        open={snackbarState.open}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={6000}
        onClose={onSnackbarClose}
      >
        <SnackbarContent
          message={snackbarState.message}
          sx={{ fontSize: 14 }}
          action={snackbarAction}
        />
      </Snackbar>
      <YouTubePlayerButton label="Screenshot" onClick={onScreenshotClick} />
      <YouTubePlayerButton label="PDF" onClick={onPdfGenClick} />
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <ContentPageApp />
  </React.StrictMode>,
  appContainer
);
