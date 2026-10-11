// Tests for keeping a brick's head measured while the brick moves under it. The stores are the
// real ones, driven the way a pan, a zoom, a brick move and a delete drive them. jsdom lays nothing
// out, so the brick's element and the canvas are stubbed with the boxes they would have, and the
// animation frame the hook waits for is run by hand.

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StatementBrickModel } from '@/models/brick';
import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceScaleStore } from '@/stores/scale';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';

import { useBrickHeadOnScreen } from './useBrickHeadOnScreen';

// -------------------------------------------------------------------------------------------------

const colorsDefault = { background: '#e07a5f', foreground: '#ffffff', border: '#00000033' };

/** Where the brick's element sits on the page; tests move it the way a pan or a zoom would. */
const brickBox = { left: 100, top: 200, right: 230 };
/** The brick's head within its element: 2px down, 24px tall. */
const HEAD = { y: 2, h: 24 };
/** The canvas's box on the page. */
const CANVAS = { left: 0, top: 0, right: 1000, bottom: 700 };

let frames: FrameRequestCallback[] = [];

/** Runs the animation frame the hook is waiting on, as the browser would before its next paint. */
function nextFrame() {
  act(() => {
    const due = frames;
    frames = [];
    due.forEach((frame) => frame(0));
  });
}

/** Puts a one-brick tower on the canvas, and the brick's and the canvas's elements on the page. */
function seat() {
  const model = new StatementBrickModel({
    id: 'repeat-1',
    colorsDefault,
    tooltipText: 'Repeats the bricks inside it.',
    widget: { type: 'label', text: 'repeat' },
    params: [],
  });
  vi.spyOn(model, 'bounds', 'get').mockReturnValue({ widget: { x: 4, ...HEAD, w: 60 } });
  useWorkspaceStore.getState().createTower({
    id: 'tower-1',
    root: { kind: 'statement', model, prev: null, next: null, args: [], nestedNext: undefined },
    position: { x: 0, y: 0 },
  });

  const brick = document.createElement('div');
  brick.dataset.towerBrick = '';
  brick.dataset.id = model.id;
  vi.spyOn(brick, 'getBoundingClientRect').mockImplementation(() => ({ ...brickBox }) as DOMRect);

  const canvas = document.createElement('div');
  canvas.setAttribute('data-workspace-canvas', '');
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(CANVAS as DOMRect);

  document.body.append(canvas, brick);
}

/** The head's box for the brick's element at `box`. */
function headAt(box: typeof brickBox) {
  return { x: box.left, y: box.top + HEAD.y, w: box.right - box.left, h: HEAD.h };
}

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (frame: FrameRequestCallback) => frames.push(frame));
  vi.stubGlobal('cancelAnimationFrame', () => {
    frames = [];
  });
  Object.assign(brickBox, { left: 100, top: 200, right: 230 });
  seat();
});

afterEach(() => {
  cleanup();
  frames = [];
  document.body.innerHTML = '';
  useWorkspaceStore.setState({ towers: {} });
  useWorkspaceViewportStore.setState({ offset: { x: 0, y: 0 } });
  useWorkspaceScaleStore.getState().reset();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// -------------------------------------------------------------------------------------------------

describe('useBrickHeadOnScreen', () => {
  it('starts from where the head was found, without measuring again', () => {
    const initial = { x: 1, y: 2, w: 3, h: 4 };

    const { result } = renderHook(() => useBrickHeadOnScreen('repeat-1', initial));

    expect(result.current).toBe(initial);
    expect(frames).toHaveLength(0);
  });

  it('follows the head when the canvas pans', () => {
    const { result } = renderHook(() => useBrickHeadOnScreen('repeat-1', headAt(brickBox)));

    act(() => useWorkspaceViewportStore.getState().panBy({ x: 50, y: 30 }));
    Object.assign(brickBox, { left: 150, top: 230, right: 280 });
    nextFrame();

    expect(result.current).toEqual(headAt(brickBox));
  });

  it('follows the head when the workspace zooms, the brick growing with it', () => {
    const { result } = renderHook(() => useBrickHeadOnScreen('repeat-1', headAt(brickBox)));

    act(() => useWorkspaceScaleStore.getState().zoomIn());
    brickBox.right = 260;
    nextFrame();

    expect(result.current?.w).toBe(160);
  });

  it('follows the brick when it is moved', () => {
    const { result } = renderHook(() => useBrickHeadOnScreen('repeat-1', headAt(brickBox)));

    act(() => useBrickLayoutStore.getState().setCoords('repeat-1', { x: 400, y: 100 }));
    Object.assign(brickBox, { left: 400, top: 100, right: 530 });
    nextFrame();

    expect(result.current).toEqual(headAt(brickBox));
  });

  it('measures several changes in one frame once', () => {
    renderHook(() => useBrickHeadOnScreen('repeat-1', headAt(brickBox)));

    act(() => {
      useWorkspaceViewportStore.getState().panBy({ x: 10, y: 0 });
      useWorkspaceViewportStore.getState().panBy({ x: 10, y: 0 });
      useWorkspaceScaleStore.getState().zoomIn();
    });

    expect(frames).toHaveLength(1);
  });

  it('is null once the brick is deleted', () => {
    const { result } = renderHook(() => useBrickHeadOnScreen('repeat-1', headAt(brickBox)));

    act(() => useWorkspaceStore.getState().removeTower('tower-1'));
    nextFrame();

    expect(result.current).toBeNull();
  });

  it('is null while the head is panned out of the canvas, and back once it returns', () => {
    const { result } = renderHook(() => useBrickHeadOnScreen('repeat-1', headAt(brickBox)));

    act(() => useWorkspaceViewportStore.getState().panBy({ x: 0, y: 600 }));
    Object.assign(brickBox, { top: 800 });
    nextFrame();
    expect(result.current).toBeNull();

    act(() => useWorkspaceViewportStore.getState().panBy({ x: 0, y: -600 }));
    Object.assign(brickBox, { top: 200 });
    nextFrame();
    expect(result.current).toEqual(headAt(brickBox));
  });

  it('stops listening once unmounted', () => {
    const { unmount } = renderHook(() => useBrickHeadOnScreen('repeat-1', headAt(brickBox)));
    unmount();

    act(() => useWorkspaceViewportStore.getState().panBy({ x: 50, y: 0 }));

    expect(frames).toHaveLength(0);
  });
});
