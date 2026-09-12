// Tests for the hook that pans the workspace off a background drag. interact.js pointer
// choreography is not reproducible reliably under jsdom, so the draggable is mocked and its `move`
// listener driven by hand; what is asserted is the wiring — which presses are left alone, where a
// move ends up, and that the viewport element follows the store. The file is .tsx so it runs in
// the dom project.

import { cleanup, renderHook } from '@testing-library/react';
import interact from 'interactjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useWorkspaceViewportStore } from '@/stores/viewport';
import { TOWER_BRICK_SELECTOR } from '@/utils/constants';

import { useCanvasPan } from './useCanvasPan';

// -------------------------------------------------------------------------------------------------

const { draggable, unset } = vi.hoisted(() => ({
  draggable: vi.fn(),
  unset: vi.fn(),
}));

vi.mock('interactjs', () => ({
  default: vi.fn(() => ({
    draggable: (options: unknown) => {
      draggable(options);
      return { unset };
    },
  })),
}));

/** The options the hook handed to `draggable`; only the wiring under test is typed. */
function draggableOptions() {
  return draggable.mock.calls[0][0] as {
    ignoreFrom: string;
    cursorChecker: (
      action: unknown,
      interactable: unknown,
      element: unknown,
      interacting: boolean,
    ) => string;
    listeners: { move: (event: { dx: number; dy: number }) => void };
  };
}

/** Mounts the hook on a canvas holding a viewport node, the way `Workspace` does. */
function mountCanvasPan() {
  const canvas = document.createElement('div');
  const viewport = document.createElement('div');
  canvas.append(viewport);

  const hook = renderHook(() =>
    useCanvasPan({ canvasRef: { current: canvas }, viewportRef: { current: viewport } }),
  );

  return { canvas, viewport, ...hook };
}

afterEach(() => {
  // Unmount here, ahead of the mock resets, so the previous test's `unset` cannot leak into the
  // next one's count.
  cleanup();
  vi.mocked(interact).mockClear();
  draggable.mockClear();
  unset.mockClear();
  useWorkspaceViewportStore.setState({ offset: { x: 0, y: 0 } });
});

// -------------------------------------------------------------------------------------------------

describe('useCanvasPan', () => {
  it('binds one draggable to the canvas that leaves a press on a brick to the brick', () => {
    const { canvas } = mountCanvasPan();

    expect(interact).toHaveBeenCalledTimes(1);
    expect(interact).toHaveBeenCalledWith(canvas);
    expect(draggableOptions().ignoreFrom).toContain(TOWER_BRICK_SELECTOR);
    // The zoom controls sit on the canvas too, and pressing one is a click, not a pan.
    expect(draggableOptions().ignoreFrom).toContain('button');
  });

  it('pans the store by each pointer delta and moves the viewport node to match', () => {
    const { viewport } = mountCanvasPan();
    const { move } = draggableOptions().listeners;

    move({ dx: 12, dy: 4 });
    move({ dx: 3, dy: 5 });

    expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 15, y: 9 });
    expect(viewport.style.transform).toBe('translate(15px, 9px)');
  });

  it('moves the viewport node for any write to the store, not just a drag', () => {
    const { viewport } = mountCanvasPan();

    useWorkspaceViewportStore.getState().setOffset({ x: 40, y: 20 });
    expect(viewport.style.transform).toBe('translate(40px, 20px)');

    useWorkspaceViewportStore.getState().resetOffset();
    expect(viewport.style.transform).toBe('translate(0px, 0px)');
  });

  it('applies an offset the store already holds when it mounts', () => {
    useWorkspaceViewportStore.setState({ offset: { x: 70, y: 30 } });

    const { viewport } = mountCanvasPan();

    expect(viewport.style.transform).toBe('translate(70px, 30px)');
  });

  it('offers the open hand until a pan starts, then closes it', () => {
    mountCanvasPan();
    const { cursorChecker } = draggableOptions();

    // Interact only asks once a pan is preparable, so `grab` never reaches a brick.
    expect(cursorChecker(null, null, null, false)).toBe('grab');
    expect(cursorChecker(null, null, null, true)).toBe('grabbing');
  });

  it('releases the draggable and stops following the store once unmounted', () => {
    const { viewport, unmount } = mountCanvasPan();

    unmount();
    expect(unset).toHaveBeenCalledTimes(1);

    useWorkspaceViewportStore.getState().setOffset({ x: 100, y: 100 });
    expect(viewport.style.transform).toBe('translate(0px, 0px)');
  });
});
