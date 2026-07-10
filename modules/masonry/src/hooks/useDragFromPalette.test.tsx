// Tests for the palette-drag hook's pure coordinate conversion. Real pointer-event choreography
// (interact.js pointerdown/move/up) is not reproducible reliably under jsdom, so drag lifecycle
// behavior is exercised via the playground/Storybook instead; only the math is unit-tested here.
// The file is .tsx so it runs in the dom project — importing the hook pulls in interact.js,
// which expects a window at module scope.

import { describe, expect, it } from 'vitest';

import { clientToLocalPoint } from './useDragFromPalette';

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
});
