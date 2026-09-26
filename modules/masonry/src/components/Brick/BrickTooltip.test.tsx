// Component test for BrickTooltip, the tooltip a brick trigger renders. jsdom does no layout, so
// anchors are passed in as client rects and the tooltip's own height is stubbed where placement
// depends on it. When it opens and closes is the hook's, covered in useBrickTooltip.test.tsx.

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { BrickTooltip } from './BrickTooltip';

afterEach(cleanup);

const TEXT = 'Plays one note for the given duration';

describe('BrickTooltip', () => {
  /** A client rect for an anchor at `top`, in the shape `getBoundingClientRect` returns. */
  const rect = (top: number, left = 40): DOMRect =>
    ({
      top,
      bottom: top + 44,
      left,
      right: left + 120,
      width: 120,
      height: 44,
      x: left,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect;

  it('renders into document.body, so no ancestor can clip it', () => {
    const { container } = render(<BrickTooltip id="tip" text={TEXT} anchor={rect(200)} />);

    expect(container.querySelector('[role="tooltip"]')).toBeNull();
    expect(document.body.contains(screen.getByRole('tooltip'))).toBe(true);
  });

  it('sits above the anchor when there is room', () => {
    render(<BrickTooltip id="tip" text={TEXT} anchor={rect(200)} />);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.style.top).toBe('192px');
    expect(tooltip.style.transform).toBe('translateY(-100%)');
  });

  it('flips below the anchor when its measured height does not fit above', () => {
    // jsdom lays nothing out, so the tooltip is given a height it cannot fit above the anchor.
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function (this: Element) {
      return this.getAttribute('role') === 'tooltip'
        ? ({ ...rect(0), height: 60 } as DOMRect)
        : original.call(this);
    };

    try {
      render(<BrickTooltip id="tip" text={TEXT} anchor={rect(30)} />);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.style.top).toBe('82px');
      expect(tooltip.style.transform).toBe('');
    } finally {
      Element.prototype.getBoundingClientRect = original;
    }
  });

  /**
   * Runs `body` with the window `innerWidth` wide and the tooltip rendering `width` wide, since
   * jsdom lays nothing out and measures every element at zero.
   */
  function withLayout(innerWidth: number, width: number, body: () => void) {
    const originalWidth = window.innerWidth;
    const original = Element.prototype.getBoundingClientRect;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: innerWidth });
    Element.prototype.getBoundingClientRect = function (this: Element) {
      return this.getAttribute('role') === 'tooltip'
        ? ({ ...rect(0), width, height: 24 } as DOMRect)
        : original.call(this);
    };

    try {
      body();
    } finally {
      Element.prototype.getBoundingClientRect = original;
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
    }
  }

  it('caps its width to a window narrower than the default', () => {
    withLayout(200, 184, () => {
      render(<BrickTooltip id="tip" text={TEXT} anchor={rect(200, 150)} />);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.style.maxWidth).toBe('184px');
      expect(tooltip.style.left).toBe('8px');
    });
  });

  it('keeps a short tooltip against a brick near the right edge', () => {
    // 80px wide at 900px fits in a 1000px window, so there is nothing to pull it left for.
    withLayout(1000, 80, () => {
      render(<BrickTooltip id="tip" text="Note" anchor={rect(200, 900)} />);

      expect(screen.getByRole('tooltip').style.left).toBe('900px');
    });
  });

  it('slides a tooltip left only as far as it needs to stay inside the window', () => {
    // 200px wide at 900px would run to 1100px, so it moves to end 8px short of the 1000px edge.
    withLayout(1000, 200, () => {
      render(<BrickTooltip id="tip" text={TEXT} anchor={rect(200, 900)} />);

      expect(screen.getByRole('tooltip').style.left).toBe('792px');
    });
  });
});
