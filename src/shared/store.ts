// shared global application state for React Components in content/popup (using chrome.storage under the hood)
// CAUTION: you cannot use the state (first return value from createChromeStorageStateHookSync()) outside of React
// initially it always has the specified initial value
import { createChromeStorageStateHookSync } from 'use-chrome-storage';
import { KeyComboKeys } from './keyboard-shortcuts';

const SETTINGS_KEY = 'settings';

export interface Settings {
  enableOCR: boolean;
  createPdfKeyComboKeys: KeyComboKeys;
  screenshotKeyComboKeys: KeyComboKeys;
  changeSaveDirectoryKeyComboKeys: KeyComboKeys;
}

export type ShortcutKeyCombos = Pick<
  Settings,
  | 'changeSaveDirectoryKeyComboKeys'
  | 'createPdfKeyComboKeys'
  | 'screenshotKeyComboKeys'
>;

const defaultCreatePdfKeyComboKeys: KeyComboKeys = {
  code: 'KeyC',
  shiftKey: true,
  ctrlKey: true,
};
const defaultScreenshotKeyComboKeys: KeyComboKeys = {
  code: 'KeyS',
  shiftKey: true,
  ctrlKey: true,
};

const defaultChangeSaveDirectoryKeyComboKeys: KeyComboKeys = {
  code: 'KeyD',
  shiftKey: true,
  ctrlKey: true,
};

const INITIAL_SETTINGS_VALUE: Settings = {
  enableOCR: false,
  createPdfKeyComboKeys: defaultCreatePdfKeyComboKeys,
  screenshotKeyComboKeys: defaultScreenshotKeyComboKeys,
  changeSaveDirectoryKeyComboKeys: defaultChangeSaveDirectoryKeyComboKeys,
};

// TODO: figure out if this can be done in type-safe fashion in some way
export const useSettingsStore = createChromeStorageStateHookSync(
  SETTINGS_KEY,
  INITIAL_SETTINGS_VALUE
);
