// shared global application state for React Components in content/popup (using chrome.storage under the hood)
// CAUTION: you cannot use the state (first return value from createChromeStorageStateHookSync()) outside of React
// initially it always has the specified initial value
import { createChromeStorageStateHookSync } from 'use-chrome-storage';

const SETTINGS_KEY = 'settings';
const INITIAL_VALUE = {
  enableOCR: false,
};

// TODO: figure out if this can be done in type-safe fashion in some way
export const useSettingsStore = createChromeStorageStateHookSync(
  SETTINGS_KEY,
  INITIAL_VALUE
);
