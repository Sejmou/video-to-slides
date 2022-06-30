import { Message } from '@mui/icons-material';
import { Settings, ShortcutKeyCombos } from './store';

export interface MessageBase {
  type: MessageTypes;
}

export interface DirectoryChangeRequest extends MessageBase {
  type: typeof MessageTypes.directoryChangeRequest;
}

export interface CurrentDirectoryQuery extends MessageBase {
  type: typeof MessageTypes.currentDirectoryQuery;
}

export interface DirectoryChange extends MessageBase {
  type: typeof MessageTypes.directoryResponse;
  dirName: string;
}

export interface ShortcutUpdate extends MessageBase {
  type: typeof MessageTypes.shortcutUpdate;
  shortcuts: ShortcutKeyCombos;
}

// When adding new message types...

// declare message type names here ...
export enum MessageTypes {
  directoryChangeRequest = 'directory change request',
  currentDirectoryQuery = 'current directory query',
  directoryResponse = 'directory response',
  shortcutUpdate = 'update shortcuts',
}

// ...and add them to this array as well
const MESSAGETYPE_NAMES = [
  MessageTypes.directoryChangeRequest,
  MessageTypes.directoryResponse,
  MessageTypes.currentDirectoryQuery,
  MessageTypes.shortcutUpdate,
] as const;

// Also update this when adding new message types...
type Message =
  | DirectoryChange
  | DirectoryChangeRequest
  | CurrentDirectoryQuery
  | ShortcutUpdate;

// ...and add a type guard
export function isDirectoryChangeRequest(
  message: MessageBase
): message is DirectoryChangeRequest {
  return message.type === MessageTypes.directoryChangeRequest;
}

export function isDirectoryChange(
  message: MessageBase
): message is DirectoryChange {
  return message.type === MessageTypes.directoryResponse;
}

export function isCurrentDirectoryQuery(
  message: MessageBase
): message is CurrentDirectoryQuery {
  return message.type === MessageTypes.currentDirectoryQuery;
}

export function isShortcutUpdate(
  message: MessageBase
): message is ShortcutUpdate {
  return message.type === MessageTypes.shortcutUpdate;
}

function isMessage(input: any): input is MessageBase {
  if (typeof input === 'object') {
    if (input.type !== undefined && typeof input.type === 'string') {
      return MESSAGETYPE_NAMES.includes(input.type);
    }

    return false;
  }
  return false;
}

export function sendMessageToContentScript(message: Message) {
  console.log('sending message to content script:', message);
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    const activeTab = tabs[0];
    if (activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, message);
    }
  });
}

export function sendMessageToPopupScript(message: Message) {
  console.log('sending message to popup script:', message);
  chrome.runtime.sendMessage(message);
}

export function addMessageListener(
  listener: (
    message: MessageBase,
    sender?: chrome.runtime.MessageSender
  ) => void
) {
  chrome.runtime.onMessage.addListener((arbitraryMessage, sender) => {
    if (isMessage(arbitraryMessage)) {
      // message is one of the defined messages
      listener(arbitraryMessage, sender);
    }
  });
}

export function removeMessageListener(
  listener: (
    message: MessageBase,
    sender?: chrome.runtime.MessageSender
  ) => void
) {
  chrome.runtime.onMessage.removeListener(listener);
}
