// Component test for the help panel the pie menu's help wedge opens. The panel is driven through
// its store, the way the wedge opens it. jsdom lays nothing out, so where position depends on the
// panel's size, the size is stubbed.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StatementBrickModel } from '@/models/brick';
import { useBrickHelpStore } from '@/stores/brickHelp';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';
import type { BrickHelp } from '@/utils/brick-help';

import { besideAnchor, HelpPanel } from './HelpPanel';

// -------------------------------------------------------------------------------------------------

const PANEL = { w: 320, h: 200 };

afterEach(() => {
  cleanup();
  useBrickHelpStore.setState({ help: null });
  useWorkspaceStore.setState({ areBricksHidden: false });
  vi.restoreAllMocks();
});

/** Help for a "repeat" brick, the way the wedge captures it. */
function helpFor(title = 'repeat', anchor: BrickHelp['anchor'] = null): BrickHelp {
  return {
    brickId: 'repeat-1',
    title,
    anchor,
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

    it('closes when the bricks are hidden, and stays closed when they are shown again', () => {
      open();

      act(() => {
        useWorkspaceStore.getState().setBricksHidden(true);
      });
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(useBrickHelpStore.getState().help).toBeNull();

      act(() => {
        useWorkspaceStore.getState().setBricksHidden(false);
      });
      expect(screen.queryByRole('dialog')).toBeNull();
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
    it('opens centred in the window when its brick could not be found on screen', () => {
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

  describe('beside its brick', () => {
    // A brick's head on the left of jsdom's 1024 x 768 window, with room for the panel on its right.
    const HEAD = { x: 100, y: 300, w: 80, h: 40 };
    // The arrow sticks out 8px and stops 6px short of the head.
    const OFFSET = 14;

    it('opens to the right of the head, its title bar level with it, pointing at it', () => {
      stubPanelSize();
      const dialog = open(helpFor('repeat', HEAD));

      expect(dialog.style.left).toBe(`${HEAD.x + HEAD.w + OFFSET}px`);
      expect(dialog.style.top).toBe(`${HEAD.y + HEAD.h / 2 - 20}px`);
      const arrow = screen.getByTestId('help-panel-arrow');
      expect(arrow.dataset.side).toBe('left');
      // The arrow's centre is 20px down the panel's side, on the head's middle.
      expect(parseFloat(arrow.style.top) + parseFloat(arrow.style.height) / 2).toBeCloseTo(20);
    });

    it('drops its arrow once dragged away from the brick', () => {
      stubPanelSize();
      open(helpFor('repeat', HEAD));
      const titleBar = screen.getByTestId('help-panel-title-bar');

      act(() => {
        fireEvent.pointerDown(titleBar, { clientX: 400, clientY: 300, pointerId: 1 });
        fireEvent.pointerMove(titleBar, { clientX: 450, clientY: 330, pointerId: 1 });
        fireEvent.pointerUp(titleBar, { clientX: 450, clientY: 330, pointerId: 1 });
      });

      expect(screen.queryByTestId('help-panel-arrow')).toBeNull();
    });

    it('opens to the left of a head with no room on its right', () => {
      const head = { ...HEAD, x: 800 };

      const { position, arrow } = besideAnchor(head, PANEL);

      expect(position.x).toBe(head.x - OFFSET - PANEL.w);
      expect(arrow?.side).toBe('right');
    });

    it('keeps the arrow on the head when the panel is held inside the window', () => {
      // A head at the very top: the panel cannot rise to be level with it, so the arrow moves up
      // the panel's side instead, as far as its rounded corner allows.
      const { position, arrow } = besideAnchor({ ...HEAD, y: 0, h: 20 }, PANEL);

      expect(position.y).toBe(8);
      expect(arrow?.y).toBe(16);
    });

    it('gives up the arrow when neither side has room', () => {
      const { arrow } = besideAnchor({ x: 0, y: 300, w: 1024, h: 40 }, PANEL);

      expect(arrow).toBeNull();
    });
  });

  describe('when the window resizes', () => {
    /** Narrows jsdom's 1024px window to `width` and tells the page, as a browser resize does. */
    function resizeWindowTo(width: number) {
      act(() => {
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
        window.dispatchEvent(new Event('resize'));
      });
    }

    afterEach(() => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
    });

    it('places itself beside its brick again, flipping sides when it no longer fits', () => {
      stubPanelSize();
      // Room on the right at 1024px, but not once the window narrows to 800px.
      const head = { x: 600, y: 300, w: 80, h: 40 };
      const dialog = open(helpFor('repeat', head));
      expect(dialog.style.left).toBe('694px');

      resizeWindowTo(800);

      expect(dialog.style.left).toBe(`${head.x - 14 - PANEL.w}px`);
      expect(screen.getByTestId('help-panel-arrow').dataset.side).toBe('right');
    });

    it('once dragged, stays where it was put, only pulled back inside the window', () => {
      stubPanelSize();
      const dialog = open();
      const titleBar = screen.getByTestId('help-panel-title-bar');

      // Dragged to the right edge of the 1024px window.
      act(() => {
        fireEvent.pointerDown(titleBar, { clientX: 400, clientY: 300, pointerId: 1 });
        fireEvent.pointerMove(titleBar, { clientX: 2000, clientY: 300, pointerId: 1 });
        fireEvent.pointerUp(titleBar, { clientX: 2000, clientY: 300, pointerId: 1 });
      });
      expect(dialog.style.left).toBe(`${1024 - PANEL.w - 8}px`);
      const top = dialog.style.top;

      resizeWindowTo(800);

      expect(dialog.style.left).toBe(`${800 - PANEL.w - 8}px`);
      expect(dialog.style.top).toBe(top);
    });
  });

  describe('following its brick', () => {
    // The brick's element on the page, moved by hand where a pan would move it; jsdom lays nothing
    // out. Its head is the row at its top, 24px tall.
    const brickBox = { left: 100, top: 300, right: 180 };
    const headNow = () => ({
      x: brickBox.left,
      y: brickBox.top,
      w: brickBox.right - brickBox.left,
      h: 24,
    });
    let frames: FrameRequestCallback[] = [];

    /** Runs the animation frame the panel waits on before measuring its brick again. */
    function nextFrame() {
      act(() => {
        const due = frames;
        frames = [];
        due.forEach((frame) => frame(0));
      });
    }

    /** Pans the canvas, and moves the brick's element by as much, as the viewport transform does. */
    function pan(delta: { x: number; y: number }) {
      act(() => useWorkspaceViewportStore.getState().panBy(delta));
      brickBox.left += delta.x;
      brickBox.right += delta.x;
      brickBox.top += delta.y;
      nextFrame();
    }

    beforeEach(() => {
      Object.assign(brickBox, { left: 100, top: 300, right: 180 });
      frames = [];
      vi.stubGlobal('requestAnimationFrame', (frame: FrameRequestCallback) => frames.push(frame));
      vi.stubGlobal('cancelAnimationFrame', () => {
        frames = [];
      });

      const model = new StatementBrickModel({
        id: 'repeat-1',
        colorsDefault: { background: '#e07a5f', foreground: '#ffffff', border: '#00000033' },
        tooltipText: 'Repeats the bricks inside it the given number of times.',
        widget: { type: 'label', text: 'repeat' },
        params: [],
      });
      vi.spyOn(model, 'bounds', 'get').mockReturnValue({ widget: { x: 4, y: 0, w: 60, h: 24 } });
      useWorkspaceStore.getState().createTower({
        id: 'tower-1',
        root: { kind: 'statement', model, prev: null, next: null, args: [], nestedNext: undefined },
        position: { x: 0, y: 0 },
      });

      const brick = document.createElement('div');
      brick.dataset.towerBrick = '';
      brick.dataset.id = model.id;
      vi.spyOn(brick, 'getBoundingClientRect').mockImplementation(
        () => ({ ...brickBox }) as DOMRect,
      );
      document.body.appendChild(brick);
    });

    afterEach(() => {
      document.querySelectorAll('[data-tower-brick]').forEach((brick) => brick.remove());
      useWorkspaceStore.setState({ towers: {} });
      useWorkspaceViewportStore.setState({ offset: { x: 0, y: 0 } });
      vi.unstubAllGlobals();
    });

    it('moves with its brick when the canvas pans, still pointing at it', () => {
      stubPanelSize();
      const dialog = open(helpFor('repeat', headNow()));
      expect(dialog.style.left).toBe('194px');

      pan({ x: 200, y: 100 });

      expect(dialog.style.left).toBe('394px');
      expect(dialog.style.top).toBe(`${300 + 100 + 12 - 20}px`);
      expect(screen.getByTestId('help-panel-arrow')).toBeTruthy();
    });

    it('stays where it was put once dragged, whatever its brick does', () => {
      stubPanelSize();
      const dialog = open(helpFor('repeat', headNow()));
      const titleBar = screen.getByTestId('help-panel-title-bar');
      act(() => {
        fireEvent.pointerDown(titleBar, { clientX: 400, clientY: 300, pointerId: 1 });
        fireEvent.pointerMove(titleBar, { clientX: 450, clientY: 330, pointerId: 1 });
        fireEvent.pointerUp(titleBar, { clientX: 450, clientY: 330, pointerId: 1 });
      });
      const dragged = { left: dialog.style.left, top: dialog.style.top };

      pan({ x: 200, y: 100 });

      expect({ left: dialog.style.left, top: dialog.style.top }).toEqual(dragged);
      expect(screen.queryByTestId('help-panel-arrow')).toBeNull();
    });

    it('keeps its place without an arrow once its brick is deleted', () => {
      stubPanelSize();
      const dialog = open(helpFor('repeat', headNow()));
      const before = { left: dialog.style.left, top: dialog.style.top };

      act(() => useWorkspaceStore.getState().removeTower('tower-1'));
      nextFrame();

      expect(screen.getByRole('dialog')).toBeTruthy();
      expect({ left: dialog.style.left, top: dialog.style.top }).toEqual(before);
      expect(screen.queryByTestId('help-panel-arrow')).toBeNull();
    });
  });
});
