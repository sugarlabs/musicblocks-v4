// Tests for the palette-drag hook. Real pointer-event choreography (interact.js
// pointerdown/move/up) is not reproducible reliably under jsdom, so the coordinate maths is
// unit-tested directly and the drop path is driven through a mocked draggable's own listeners,
// the way `useCanvasPan`'s tests do. The file is .tsx so it runs in the dom project — importing
// the hook pulls in interact.js, which expects a window at module scope.

import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Point } from '@/@types/common.types';
import type { PaletteBrickConfig } from '@/@types/palette.types';

import { useWorkspaceViewportStore } from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';

import { clientToLocalPoint, useDragFromPalette } from './useDragFromPalette';

// -------------------------------------------------------------------------------------------------

const { draggable } = vi.hoisted(() => ({ draggable: vi.fn() }));

vi.mock('interactjs', () => ({
  default: vi.fn(() => ({
    draggable: (options: unknown) => {
      draggable(options);
      return { unset: vi.fn() };
    },
  })),
}));

/** Canvas sits right of the palette, so its left edge is the boundary a drop must clear. */
const CANVAS_RECT = { left: 300, top: 50, right: 1000, bottom: 700 };
const SLOT_RECT = { left: 10, top: 10, right: 90, bottom: 50 };

const NOTE: PaletteBrickConfig = {
  id: 'r1',
  name: 'Note',
  description: 'play a note',
  brick: {
    kind: 'statement',
    widget: { type: 'label', text: 'Note' },
    colorsDefault: { background: '#123456', foreground: '#ffffff', border: '#00000033' },
    tooltipText: 'Note',
    hasConnectionPrev: true,
    hasConnectionNext: true,
  },
};

/** jsdom reports every rect as zero, so the few the hook measures are stubbed. */
function stubRect(el: HTMLElement, rect: typeof CANVAS_RECT) {
  el.getBoundingClientRect = () =>
    ({
      ...rect,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top,
      x: rect.left,
      y: rect.top,
      toJSON: () => ({}),
    }) as DOMRect;
}

function dragListeners() {
  return (draggable.mock.calls[0][0] as { listeners: Record<string, (event: unknown) => void> })
    .listeners;
}

/** Mounts the hook over a palette slot and a canvas, the way `Workspace` does. */
function mountPaletteDrag() {
  const root = document.createElement('div');
  const canvas = document.createElement('div');
  const ghost = document.createElement('div');
  const slot = document.createElement('div');
  slot.setAttribute('data-brick-id', NOTE.id);
  root.append(canvas, ghost, slot);
  document.body.append(root);

  stubRect(root, { left: 0, top: 0, right: 1000, bottom: 700 });
  stubRect(canvas, CANVAS_RECT);
  stubRect(slot, SLOT_RECT);

  renderHook(() =>
    useDragFromPalette({
      rootRef: { current: root },
      canvasRef: { current: canvas },
      ghostRef: { current: ghost },
      bricksById: { [NOTE.id]: NOTE },
    }),
  );

  return { slot };
}

/** Grabs the slot `grabOffset` px in from its top-left and releases at client point `release`. */
function dragSlotTo(slot: HTMLElement, grabOffset: Point, release: Point) {
  const { start, end } = dragListeners();

  start({
    target: slot,
    clientX0: SLOT_RECT.left + grabOffset.x,
    clientY0: SLOT_RECT.top + grabOffset.y,
  });
  end({ clientX: release.x, clientY: release.y });
}

function droppedTowers() {
  return Object.values(useWorkspaceStore.getState().towers);
}

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  draggable.mockClear();
  useWorkspaceStore.setState({ towers: {} });
  useWorkspaceViewportStore.setState({ offset: { x: 0, y: 0 } });
});

// -------------------------------------------------------------------------------------------------

describe('clientToLocalPoint', () => {
  it('converts a client point to coordinates local to the given origin', () => {
    const local = clientToLocalPoint({ x: 500, y: 300 }, { x: 320, y: 40 }, { x: 0, y: 0 });

    expect(local).toEqual({ x: 180, y: 260 });
  });

  it('subtracts the grab offset so the result is the dragged element top-left, not the pointer', () => {
    const local = clientToLocalPoint({ x: 500, y: 300 }, { x: 320, y: 40 }, { x: 12, y: 7 });

    expect(local).toEqual({ x: 168, y: 253 });
  });

  it('yields (0, 0) when the pointer grabs an element sitting exactly at the origin', () => {
    // Pointer at (330, 50), element top-left at (320, 40) → grab offset (10, 10).
    const local = clientToLocalPoint({ x: 330, y: 50 }, { x: 320, y: 40 }, { x: 10, y: 10 });

    expect(local).toEqual({ x: 0, y: 0 });
  });

  it('produces negative coordinates for points up-left of the origin', () => {
    const local = clientToLocalPoint({ x: 10, y: 20 }, { x: 320, y: 40 }, { x: 5, y: 5 });

    expect(local).toEqual({ x: -315, y: -25 });
  });

  it('takes the viewport offset back out, so a drop on a panned canvas lands unpanned', () => {
    // The content is panned 100 right and 40 down, so the pointer at canvas-local (180, 260) is
    // over the unpanned point (80, 220).
    const local = clientToLocalPoint(
      { x: 500, y: 300 },
      { x: 320, y: 40 },
      { x: 0, y: 0 },
      { x: 100, y: 40 },
    );

    expect(local).toEqual({ x: 80, y: 220 });
  });

  it('assumes an unpanned viewport when no offset is given', () => {
    const withoutOffset = clientToLocalPoint(
      { x: 500, y: 300 },
      { x: 320, y: 40 },
      { x: 12, y: 7 },
    );
    const zeroOffset = clientToLocalPoint(
      { x: 500, y: 300 },
      { x: 320, y: 40 },
      { x: 12, y: 7 },
      { x: 0, y: 0 },
    );

    expect(withoutOffset).toEqual({ x: 168, y: 253 });
    expect(zeroOffset).toEqual(withoutOffset);
  });
});

// -------------------------------------------------------------------------------------------------

// The pan has to come back out of a drop, because a tower's position is stored in the same
// unpanned coordinates every other tower's is. Driven through the draggable's own listeners, since
// the conversion and the palette-overlap guard are both inside them rather than in exported maths.
describe('useDragFromPalette drop placement', () => {
  it('places a drop on a panned canvas where the pointer actually is', () => {
    const { slot } = mountPaletteDrag();
    useWorkspaceViewportStore.setState({ offset: { x: 150, y: 60 } });

    dragSlotTo(slot, { x: 0, y: 0 }, { x: 500, y: 250 });

    // The release is 200 in and 200 down from the canvas corner, and the canvas is panned 150
    // right and 60 down, so the content sitting under it is that much further back.
    expect(droppedTowers()).toHaveLength(1);
    expect(droppedTowers()[0].position).toEqual({ x: 50, y: 140 });
  });

  it('commits a drop clear of the palette even where that lands before the origin', () => {
    const { slot } = mountPaletteDrag();
    useWorkspaceViewportStore.getState().panBy({ x: 200, y: 0 });

    // 50px clear of the canvas edge, so nothing overhangs the palette.
    dragSlotTo(slot, { x: 0, y: 0 }, { x: 350, y: 250 });

    // Judging the overlap in canvas coordinates instead would read this as "still over the
    // palette" and throw the drop away. Note the tower lands before the origin, which is outside
    // the collision space the connectors are indexed in, so it will not snap to anything.
    expect(droppedTowers()).toHaveLength(1);
    expect(droppedTowers()[0].position.x).toBe(-150);
  });

  it('rejects a drop still overhanging the palette on a panned canvas', () => {
    const { slot } = mountPaletteDrag();
    useWorkspaceViewportStore.setState({ offset: { x: 200, y: 0 } });

    // The pointer is inside the canvas, but the brick was grabbed 40px in, so its left corner is
    // still 20px over the palette.
    dragSlotTo(slot, { x: 40, y: 0 }, { x: 320, y: 250 });

    expect(droppedTowers()).toHaveLength(0);
  });
});
