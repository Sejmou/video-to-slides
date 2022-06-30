import { KeyComboKeys } from '../../../shared/keyboard-shortcuts';

const defaultKeys: Readonly<KeyComboKeys> = {
  code: '',
  altKey: false,
  ctrlKey: false,
  shiftKey: false,
  metaKey: false,
};

export class KeyComboDetector {
  keyComboKeys: KeyComboKeys = {
    ...defaultKeys,
  };
  resolveFn?: () => void;

  listener = this.handleKeyboardEvent.bind(this);

  // this is ugly af, I know lol
  async detectNewKeyboardCombination() {
    document.addEventListener('keydown', this.listener);
    document.addEventListener('keyup', this.listener);
    return new Promise<KeyComboKeys>(resolve => {
      const resolveFn = () => resolve(this.keyComboKeys);
      this.resolveFn = resolveFn;
    });
  }

  private handleKeyboardEvent(event: KeyboardEvent) {
    if (event.type === 'keydown') {
      this.updateKeyComboKeys(event);
    } else if (event.type === 'keyup') {
      document.removeEventListener('keydown', this.listener);
      document.removeEventListener('keyup', this.listener);
      this.resolveFn?.();
    }
    event.preventDefault();
  }

  private updateKeyComboKeys(event: KeyboardEvent) {
    const { code, ctrlKey, shiftKey, altKey, metaKey } = event;
    this.keyComboKeys = {
      code,
      ctrlKey,
      shiftKey,
      altKey,
      metaKey,
    };
  }
}
