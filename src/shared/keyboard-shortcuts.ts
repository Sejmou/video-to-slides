// There may be a smarter way to store key combinations and shortcuts; If you know one, let me know lol
export interface KeyComboKeys {
  code: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}

class KeyCombination {
  keys: KeyComboKeys = {
    code: '',
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    metaKey: false,
  };

  constructor(keyComboKeys: KeyComboKeys) {
    this.keys = {
      ...this.keys,
      ...keyComboKeys,
    };
  }

  matches(keyboardEvent: KeyboardEvent) {
    if (
      keyboardEvent.code !== this.keys.code ||
      keyboardEvent.altKey !== this.keys.altKey ||
      keyboardEvent.ctrlKey !== this.keys.ctrlKey ||
      keyboardEvent.shiftKey !== this.keys.shiftKey ||
      keyboardEvent.metaKey !== this.keys.metaKey
    ) {
      return false;
    }

    return true;
  }
}

export class KeyboardShortcut {
  keyCombination: KeyCombination;
  fn: () => void;

  constructor(keys: KeyComboKeys, fn: () => void) {
    this.keyCombination = new KeyCombination(keys);
    this.fn = fn;
  }

  handle(event: KeyboardEvent) {
    if (this.keyCombination.matches(event)) {
      event.preventDefault();
      event.stopPropagation();
      console.log('matching!');
      this.fn();
      return true;
    }
    return false;
  }
}

/**
 * Stores a collection of KeyboardShortcuts; can be used to find and apply shortcuts
 */
export class KeyboardShortcuts {
  shortcuts: KeyboardShortcut[] = [];

  constructor(shortcuts?: KeyboardShortcut[]) {
    if (shortcuts) this.shortcuts = shortcuts;
    document.body.addEventListener(
      'keydown',
      ev => {
        this.applyMatching(ev);
      },
      {
        capture: true, // should increase probability that event listener is triggered
      }
    );
  }

  // TODO: multiple shortcuts may listen to same keyboardEvent - think about issuing warning or something similar
  /**
   * applies all shortcut matching the provided keyboardEvent
   * @param keyboardEvent an incoming KeyboardEvent
   */
  private applyMatching(keyboardEvent: KeyboardEvent) {
    return this.shortcuts.forEach(s => s.handle(keyboardEvent));
  }

  // TODO: add logic for checking if keybinding for KeyCombination of shortcut already exists
  add(shortcut: KeyboardShortcut) {
    this.shortcuts.push(shortcut);
  }

  /**
   * replaces all existing shortcuts with provided shortcuts
   */
  setShortcuts(newShortcuts: KeyboardShortcut[]) {
    this.shortcuts = newShortcuts;
  }
}
