// Component test for the help panel the pie menu's help wedge opens. The panel is driven through
// its store, the way the wedge opens it. jsdom lays nothing out, so where position depends on the
// panel's size, the size is stubbed.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { StatementBrickModel } from '@/models/brick';
import { useBrickHelpStore } from '@/stores/brickHelp';
import type { BrickHelp } from '@/utils/brick-help';

import { HelpPanel } from './HelpPanel';

// -------------------------------------------------------------------------------------------------

const PANEL = { w: 320, h: 200 };

afterEach(() => {
  cleanup();
  useBrickHelpStore.setState({ help: null });
  vi.restoreAllMocks();
});

/** Help for a "repeat" brick, the way the wedge captures it. */
function helpFor(title = 'repeat'): BrickHelp {
  return {
    title,
    text: 'Repeats the bricks inside it the given number of times.',
    preview: new StatementBrickModel({
      colorsDefault: { background: '#e07a5f', foreground: '#ffffff', border: '#00000033' },
      tooltipText: 'Repeats the bricks inside it the given number of times.',
      widget: { type: 'label', text: title },
      params: [],
      hasNesting: true,
    }),
  };
}

/** Gives the panel a size, so it can be centred and clamped as it would be on screen. */
function stubPanelSize() {
  const original = Element.prototype.getBoundingClientRect;
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    return this.getAttribute('role') === 'dialog'
      ? ({ width: PANEL.w, height: PANEL.h, top: 0, left: 0, right: 0, bottom: 0 } as DOMRect)
      : original.call(this);
  });
}

/** Renders the panel and opens it on `help`, as the wedge does. */
function open(help = helpFor()) {
  render(<HelpPanel />);
  act(() => {
    useBrickHelpStore.getState().show(help);
  });
  return screen.getByRole('dialog');
}

// -------------------------------------------------------------------------------------------------

describe('HelpPanel', () => {
  describe('what it shows', () => {
    it('shows nothing until help is opened', () => {
      render(<HelpPanel />);

      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it("titles itself with the brick's name and describes itself with its help text", () => {
      open();

      // The dialog's accessible name and description are its title and text.
      expect(screen.getByRole('dialog', { name: 'repeat' })).toBeTruthy();
      expect(
        screen.getByRole('dialog', {
          description: 'Repeats the bricks inside it the given number of times.',
        }),
      ).toBeTruthy();
    });

    it('draws a picture of the brick that cannot be interacted with', () => {
      open();

      const preview = screen.getByTestId('help-panel-preview');
      expect(preview.querySelector('svg')).not.toBeNull();
      expect(preview.className).toContain('pointer-events-none');
      expect(preview.getAttribute('aria-hidden')).toBe('true');
    });

    it('moves the keyboard focus to its close button as it opens', () => {
      open();

      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close help' }));
    });
  });

  describe('closing', () => {
    it('closes from its close button', () => {
      open();

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Close help' }));
      });

      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('closes on Escape', () => {
      const dialog = open();

      act(() => {
        fireEvent.keyDown(dialog, { key: 'Escape' });
      });

      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('closes on Escape pressed after the focus has left it', () => {
      open();

      // Focus moves on to something else on the page, such as a navbar button.
      const elsewhere = document.createElement('button');
      document.body.appendChild(elsewhere);
      elsewhere.focus();

      try {
        act(() => {
          fireEvent.keyDown(elsewhere, { key: 'Escape' });
        });

        expect(screen.queryByRole('dialog')).toBeNull();
      } finally {
        elsewhere.remove();
      }
    });

    it('stays open through other keys pressed elsewhere', () => {
      open();

      act(() => {
        fireEvent.keyDown(document.body, { key: 'Enter' });
      });

      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    it('stays open through a press elsewhere, so it can be read at leisure', () => {
      open();

      act(() => {
        fireEvent.pointerDown(document.body);
        fireEvent.click(document.body);
      });

      expect(screen.getByRole('dialog')).toBeTruthy();
    });
  });

  describe('keeping to itself', () => {
    it('keeps its keys from the workspace, which deletes the selected brick on Backspace', () => {
      const onWindowKey = vi.fn();
      window.addEventListener('keydown', onWindowKey);

      try {
        open();
        fireEvent.keyDown(screen.getByRole('button', { name: 'Close help' }), {
          key: 'Backspace',
        });

        expect(onWindowKey).not.toHaveBeenCalled();
      } finally {
        window.removeEventListener('keydown', onWindowKey);
      }
    });
  });

  describe('placement', () => {
    it('opens centred in the window', () => {
      stubPanelSize();
      const dialog = open();

      // jsdom's window is 1024 x 768.
      expect(dialog.style.left).toBe(`${(1024 - PANEL.w) / 2}px`);
      expect(dialog.style.top).toBe(`${(768 - PANEL.h) / 2}px`);
    });

    it('is dragged by its title bar', () => {
      stubPanelSize();
      const dialog = open();
      const titleBar = screen.getByTestId('help-panel-title-bar');

      act(() => {
        fireEvent.pointerDown(titleBar, { clientX: 400, clientY: 300, pointerId: 1 });
        fireEvent.pointerMove(titleBar, { clientX: 450, clientY: 330, pointerId: 1 });
        fireEvent.pointerUp(titleBar, { clientX: 450, clientY: 330, pointerId: 1 });
      });

      expect(dialog.style.left).toBe(`${(1024 - PANEL.w) / 2 + 50}px`);
      expect(dialog.style.top).toBe(`${(768 - PANEL.h) / 2 + 30}px`);
    });

    it('cannot be dragged out of the window', () => {
      stubPanelSize();
      const dialog = open();
      const titleBar = screen.getByTestId('help-panel-title-bar');

      act(() => {
        fireEvent.pointerDown(titleBar, { clientX: 400, clientY: 300, pointerId: 1 });
        fireEvent.pointerMove(titleBar, { clientX: -2000, clientY: -2000, pointerId: 1 });
      });

      expect(dialog.style.left).toBe('8px');
      expect(dialog.style.top).toBe('8px');
    });

    it('does not start a drag from the close button', () => {
      stubPanelSize();
      const dialog = open();
      const before = { left: dialog.style.left, top: dialog.style.top };
      const close = screen.getByRole('button', { name: 'Close help' });

      act(() => {
        fireEvent.pointerDown(close, { clientX: 400, clientY: 300, pointerId: 1 });
        fireEvent.pointerMove(screen.getByTestId('help-panel-title-bar'), {
          clientX: 500,
          clientY: 400,
          pointerId: 1,
        });
      });

      expect({ left: dialog.style.left, top: dialog.style.top }).toEqual(before);
    });

    it('re-centres as the brick preview grows it, until it is dragged', () => {
      // The preview measures itself after the panel mounts, so the panel can grow a moment later.
      const size = { w: PANEL.w, h: 100 };
      const original = Element.prototype.getBoundingClientRect;
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: Element,
      ) {
        return this.getAttribute('role') === 'dialog'
          ? ({ width: size.w, height: size.h, top: 0, left: 0, right: 0, bottom: 0 } as DOMRect)
          : original.call(this);
      });
      let resized: () => void = () => {};
      vi.stubGlobal(
        'ResizeObserver',
        class {
          constructor(callback: () => void) {
            resized = callback;
          }
          observe() {}
          disconnect() {}
        },
      );

      try {
        const dialog = open();
        expect(dialog.style.top).toBe(`${(768 - 100) / 2}px`);

        size.h = 200;
        act(() => resized());
        expect(dialog.style.top).toBe(`${(768 - 200) / 2}px`);

        // Once moved by hand it stays where it was put, whatever its size does.
        const titleBar = screen.getByTestId('help-panel-title-bar');
        act(() => {
          fireEvent.pointerDown(titleBar, { clientX: 400, clientY: 300, pointerId: 1 });
          fireEvent.pointerMove(titleBar, { clientX: 450, clientY: 330, pointerId: 1 });
          fireEvent.pointerUp(titleBar, { clientX: 450, clientY: 330, pointerId: 1 });
        });
        const dragged = dialog.style.top;

        size.h = 300;
        act(() => resized());
        expect(dialog.style.top).toBe(dragged);
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('opens centred again after being dragged, closed and reopened', () => {
      stubPanelSize();
      const dialog = open();
      const titleBar = screen.getByTestId('help-panel-title-bar');

      act(() => {
        fireEvent.pointerDown(titleBar, { clientX: 400, clientY: 300, pointerId: 1 });
        fireEvent.pointerMove(titleBar, { clientX: 500, clientY: 400, pointerId: 1 });
        fireEvent.pointerUp(titleBar, { clientX: 500, clientY: 400, pointerId: 1 });
      });
      expect(dialog.style.left).not.toBe(`${(1024 - PANEL.w) / 2}px`);

      act(() => {
        useBrickHelpStore.getState().hide();
        useBrickHelpStore.getState().show(helpFor('forever'));
      });

      const reopened = screen.getByRole('dialog', { name: 'forever' });
      expect(reopened.style.left).toBe(`${(1024 - PANEL.w) / 2}px`);
    });
  });
});
