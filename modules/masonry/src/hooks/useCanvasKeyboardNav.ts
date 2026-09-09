import { useCallback } from 'react';

import {
  FAST_PAN_STEP,
  PAGE_PAN_STEP,
  PAN_STEP,
  useViewportStore,
} from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';

/**
 * Determines if a keyboard event originated from inside an interactive text or input widget.
 *
 * Scopes keyboard navigation so it stays quiet while the user types into a brick's text/number
 * box, selects an option from a dropdown, or searches inside the palette.
 */
export function isInputFocused(event: React.KeyboardEvent | KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  if (!target) return false;

  const tagName = target.tagName ? target.tagName.toLowerCase() : '';
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
    return true;
  }

  if (
    target.isContentEditable ||
    target.contentEditable === 'true' ||
    target.getAttribute?.('contenteditable') === 'true' ||
    target.getAttribute?.('contenteditable') === ''
  ) {
    return true;
  }

  if (
    target.closest?.(
      'input, textarea, select, [contenteditable="true"], [contenteditable=""], [role="textbox"], [role="searchbox"], [role="combobox"], [data-slot="input"], [data-slot="select-trigger"], [data-brick-input]',
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Handles keyboard-based canvas viewport navigation.
 *
 * Translates the canvas viewport offset upon receiving `Home`, `End`, `PageUp`, `PageDown`,
 * and the four arrow keys, while ignoring events originating from interactive inputs.
 */
export function useCanvasKeyboardNav() {
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (isInputFocused(event)) {
      return;
    }

    const { panBy, resetOffset, panToExtent } = useViewportStore.getState();
    const towers = useWorkspaceStore.getState().towers;

    const step = event.shiftKey ? FAST_PAN_STEP : PAN_STEP;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        panBy({ x: 0, y: -step });
        break;
      case 'ArrowDown':
        event.preventDefault();
        panBy({ x: 0, y: step });
        break;
      case 'ArrowLeft':
        event.preventDefault();
        panBy({ x: -step, y: 0 });
        break;
      case 'ArrowRight':
        event.preventDefault();
        panBy({ x: step, y: 0 });
        break;
      case 'PageUp':
        event.preventDefault();
        panBy({ x: 0, y: -PAGE_PAN_STEP });
        break;
      case 'PageDown':
        event.preventDefault();
        panBy({ x: 0, y: PAGE_PAN_STEP });
        break;
      case 'Home':
        event.preventDefault();
        resetOffset();
        break;
      case 'End':
        event.preventDefault();
        panToExtent(towers);
        break;
      default:
        break;
    }
  }, []);

  return { handleKeyDown };
}
