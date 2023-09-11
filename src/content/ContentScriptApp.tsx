import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import YouTubePlayerButton from './components/YouTubePlayerButton/YouTubePlayerButton';
import { getURLQueryParams } from './util/url-queryparams';
import { storeVideoSnapshot } from './util/video-to-image';
import { createPdfFileFromImgFileHandles } from './util/images-to-pdf';
import { Settings, useSettingsStore } from '../shared/store';
import {
  InfoSnackbar,
  SnackbarState,
  AlertSeverity,
} from './components/InfoSnackbar/InfoSnackbar';
import {
  KeyboardShortcut,
  KeyboardShortcuts,
} from '../shared/keyboard-shortcuts';
import {
  addMessageListener,
  isCurrentDirectoryQuery,
  isDirectoryChangeRequest,
  isShortcutUpdate,
  MessageBase,
  MessageTypes,
  removeMessageListener,
  sendMessageToPopupScript,
} from '../shared/script-communication';

console.log('[Video to Slides] loading content script app');

const appContainer = document.createElement('div');
document.body.appendChild(appContainer);

let dirHandle: FileSystemDirectoryHandle | null;

const keyboardShortcuts = new KeyboardShortcuts();

const ContentPageApp = () => {
  const [settingsAny] = useSettingsStore();
  // TODO: figure out smarter way to get type information
  const settings = settingsAny as Settings;
  const { enableOCR, screenshotsToClipboard } = settings;

  const [snackbarState, setSnackbarState] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const video = document.querySelector('video');

  const dirAccess = async () => {
    if (!dirHandle) {
      video?.pause();
      dirHandle = await window.showDirectoryPicker();
      return dirHandle;
    }
    return dirHandle;
  };

  const onTakeScreenshot = async () => {
    try {
      const dirHandle = await dirAccess();
      const videoId = getURLQueryParams().v;
      if (!videoId) return;
      if (!video) return;

      const newFileHandle = await dirHandle.getFileHandle(
        `${videoId}_${video.currentTime.toFixed(0).padStart(5, '0')}.png`, // pad to make sure we can use alphabetical sorting to sort the files by timestamp
        { create: true }
      );

      const snapshotBlob = await storeVideoSnapshot(video, newFileHandle);
      // snapshotBlob should always be defined, but too lazy to check why this is necessary atm
      if (snapshotBlob && screenshotsToClipboard) {
        // I REALLY don't get why webpack (but not my IDE!?) complains when compiling the following line, so just ignore the error to make compilation work
        // @ts-ignore
        const clipboardItem = new ClipboardItem({
          [snapshotBlob.type]: snapshotBlob,
        });
        navigator.clipboard.write([clipboardItem]);
      }
      const message = `Screenshot saved to '${dirHandle.name}' as '${newFileHandle.name}'`;
      showSnackbar({
        message,
        severity: 'success',
        autoHideDuration: 2500,
        relatedAction: {
          label: 'Undo',
          callback: async () => {
            await dirHandle.removeEntry(newFileHandle.name);
            hideSnackbar();
          },
        },
      });
    } catch (error) {
      handleFileAccessErrors(error, 'Could not save video screenshot');
    }
  };

  const onCreatePdf = async () => {
    try {
      const videoId = getURLQueryParams().v;
      if (!videoId) {
        return;
      }
      const dirHandle = await dirAccess();

      showSnackbar({
        message: `Generating PDF from video screenshots in '${dirHandle.name}'${
          enableOCR ? ' (using text recognition, might take a while)' : ''
        }...`,
        severity: 'info',
        autoHideDuration: enableOCR ? 7000 : 4000,
      });

      const imgFileHandles: FileSystemFileHandle[] = [];

      for await (const entry of dirHandle.values()) {
        if (
          entry.kind == 'file' &&
          entry.name.includes(videoId) &&
          entry.name.endsWith('.png')
        ) {
          imgFileHandles.push(await dirHandle.getFileHandle(entry.name));
        }
      }
      imgFileHandles.sort((a, b) => a.name.localeCompare(b.name));

      if (imgFileHandles.length === 0) {
        showSnackbar({
          message: `Cannot generate PDF: No screenshot images for current video (id: ${videoId}) found!`,
          severity: 'error',
        });
        return;
      }

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
        showSnackbar({
          message: `PDF successfully generated (stored in '${dirHandle.name}' as '${pdfFileHandle.name}')`,
          severity: 'success',
        });
      } else {
        showSnackbar({
          message: `Could not generate PDF from slide images in '${dirHandle.name}'`,
          severity: 'error',
        });
      }
    } catch (error) {
      handleFileAccessErrors(error, 'PDF generation failed');
    }
  };

  const onChangeSaveDirectory = async () => {
    console.log('on change save');
    dirHandle = await window.showDirectoryPicker();
  };

  const setKeyboardShortcuts = () =>
    keyboardShortcuts.setShortcuts([
      new KeyboardShortcut(settings.createPdfKeyComboKeys, () => onCreatePdf()),
      new KeyboardShortcut(settings.screenshotKeyComboKeys, () =>
        onTakeScreenshot()
      ),
      new KeyboardShortcut(settings.changeSaveDirectoryKeyComboKeys, () =>
        onChangeSaveDirectory()
      ),
    ]);

  setKeyboardShortcuts();

  // add listener only on component mount, not on every render.
  useEffect(() => {
    const messageListener = (message: MessageBase) => {
      console.log('received message', message);
      if (isDirectoryChangeRequest(message)) {
        onChangeSaveDirectory();
      } else if (isCurrentDirectoryQuery(message)) {
        sendMessageToPopupScript({
          type: MessageTypes.directoryResponse,
          dirName: dirHandle?.name || '',
        });
      } else if (isShortcutUpdate(message)) {
        setKeyboardShortcuts();
      }
    };
    addMessageListener(messageListener);
    return () => removeMessageListener(messageListener);
  }, []);

  const onSnackbarClose = () =>
    setSnackbarState(() => ({
      open: false,
      message: '',
      severity: 'info',
    }));

  const showSnackbar = (config: Omit<SnackbarState, 'open'>) =>
    setSnackbarState(() => ({
      open: true,
      ...config,
    }));

  const hideSnackbar = () => {
    setSnackbarState(() => ({
      open: false,
      message: '',
      severity: 'info',
    }));
  };

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
      showSnackbar({
        message: [failedActionDesc, reasonDesc].join(' - '),
        severity: 'error',
      });
    }
  };

  return (
    <>
      <InfoSnackbar snackbarState={snackbarState} onClose={onSnackbarClose} />
      <YouTubePlayerButton label="Screenshot" onClick={onTakeScreenshot} />
      <YouTubePlayerButton label="PDF" onClick={onCreatePdf} />
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <ContentPageApp />
  </React.StrictMode>,
  appContainer
);
