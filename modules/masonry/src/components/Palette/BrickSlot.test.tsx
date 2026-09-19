// Component test for the palette brick slot's click-to-place path. The placement util is mocked
// out: what belongs here is whether the slot reaches for it at all — on a click, on Enter and
// Space, and not while a drag is in flight or trailing one. The cascade maths the util performs
// once called is covered by `palette-placement.test.ts`.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { BrickViewProps } from '@/@types/brick.types';
import type { PaletteBrickConfig } from '@/@types/palette.types';

import { BRICK_TOOLTIP_DELAY_MS } from '@/hooks/useBrickTooltip';
import { usePaletteDragStore } from '@/stores/palette';
import { placeBrickFromPalette } from '@/utils/palette-placement';

import { BrickSlot } from './BrickSlot';

vi.mock('@/utils/palette-placement', () => ({
  placeBrickFromPalette: vi.fn(),
}));

const place = vi.mocked(placeBrickFromPalette);

// -------------------------------------------------------------------------------------------------
// Fixtures & helpers
// -------------------------------------------------------------------------------------------------

/** A valid statement config, so the slot's live preview renders rather than throwing on mount. */
const brickProps = (name: string): BrickViewProps => ({
  kind: 'statement',
  widget: { type: 'label', text: name },
  colorsDefault: { background: '#e07a5f', foreground: '#ffffff', border: '#00000033' },
  tooltipText: name,
});

const NOTE: PaletteBrickConfig = {
  id: 'r1',
  name: 'Note',
  description: 'play a note',
  brick: brickProps('Note'),
};

/** The slot itself — the element carrying the handlers, not its wrapper. */
const slot = () => screen.getByRole('button', { name: 'Note' });

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

beforeEach(() => {
  place.mockClear();
  usePaletteDragStore.setState({ dragged: null, lastDragEndTime: 0 });
});

// -------------------------------------------------------------------------------------------------

describe('BrickSlot', () => {
  describe('tooltip', () => {
    /** Runs the hover delay down inside `act`, so the tooltip's state change is flushed. */
    function passTheDelay() {
      act(() => {
        vi.advanceTimersByTime(BRICK_TOOLTIP_DELAY_MS);
      });
    }

    it('shows the brick tooltip only after the hover delay', () => {
      vi.useFakeTimers();
      render(<BrickSlot brick={NOTE} />);

      fireEvent.pointerEnter(slot());
      act(() => {
        vi.advanceTimersByTime(BRICK_TOOLTIP_DELAY_MS - 1);
      });
      expect(screen.queryByRole('tooltip')).toBeNull();

      passTheDelay();
      expect(screen.getByRole('tooltip').textContent).toBe('Note');
    });

    it('cancels a pending tooltip when the pointer leaves first', () => {
      vi.useFakeTimers();
      render(<BrickSlot brick={NOTE} />);

      fireEvent.pointerEnter(slot());
      fireEvent.pointerLeave(slot());
      passTheDelay();

      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('keeps the tooltip out of a drag, and takes down one already showing', () => {
      vi.useFakeTimers();
      render(<BrickSlot brick={NOTE} />);

      fireEvent.pointerEnter(slot());
      passTheDelay();
      expect(screen.getByRole('tooltip')).toBeTruthy();

      // Pressing to start a drag takes it down, and the held pointer keeps it down.
      act(() => {
        fireEvent.pointerDown(slot());
      });
      expect(screen.queryByRole('tooltip')).toBeNull();

      fireEvent.pointerEnter(slot());
      passTheDelay();
      expect(screen.queryByRole('tooltip')).toBeNull();

      fireEvent.pointerUp(document.body);
    });

    it('shows the tooltip on keyboard focus, so it is not pointer only', () => {
      vi.useFakeTimers();
      render(<BrickSlot brick={NOTE} />);

      fireEvent.focus(slot());
      passTheDelay();
      expect(screen.getByRole('tooltip').textContent).toBe('Note');

      fireEvent.blur(slot());
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it("falls back to the entry's description when the brick carries no tooltip text", () => {
      vi.useFakeTimers();
      render(<BrickSlot brick={{ ...NOTE, brick: { ...NOTE.brick, tooltipText: '' } }} />);

      fireEvent.pointerEnter(slot());
      passTheDelay();

      expect(screen.getByRole('tooltip').textContent).toBe('play a note');
    });

    it('describes the slot with the tooltip while it is open (#845 review)', () => {
      vi.useFakeTimers();
      render(<BrickSlot brick={NOTE} />);

      // Closed: nothing to point at, so no dangling association.
      expect(slot().getAttribute('aria-describedby')).toBeNull();

      fireEvent.pointerEnter(slot());
      passTheDelay();

      // The button keeps the brick's short name; the tooltip arrives as its description.
      expect(slot().getAttribute('aria-label')).toBe('Note');
      expect(slot().getAttribute('aria-describedby')).toBe(screen.getByRole('tooltip').id);
    });

    it('keeps the tooltip down while a second pointer is still held (#845 review)', () => {
      vi.useFakeTimers();
      render(<BrickSlot brick={NOTE} />);

      // A touch starts a drag, then a mouse clicks and releases elsewhere: the touch is still
      // down, so its drag is still running and no tooltip may open.
      fireEvent.pointerDown(document.body, { pointerId: 1 });
      fireEvent.pointerDown(document.body, { pointerId: 2 });
      fireEvent.pointerUp(document.body, { pointerId: 2 });

      fireEvent.pointerEnter(slot());
      passTheDelay();
      expect(screen.queryByRole('tooltip')).toBeNull();

      // Once the touch lifts too, hovering works again.
      fireEvent.pointerUp(document.body, { pointerId: 1 });
      fireEvent.pointerEnter(slot());
      passTheDelay();
      expect(screen.getByRole('tooltip')).toBeTruthy();
    });

    it('renders the tooltip outside the slot, so no ancestor can clip it', () => {
      vi.useFakeTimers();
      const { container } = render(<BrickSlot brick={NOTE} />);

      fireEvent.pointerEnter(slot());
      passTheDelay();

      const tooltip = screen.getByRole('tooltip');
      expect(container.querySelector('[role="tooltip"]')).toBeNull();
      expect(document.body.contains(tooltip)).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('exposes the slot as a focusable button named after the entry', () => {
      render(<BrickSlot brick={NOTE} />);

      // Click-to-place makes the slot an actual control, so it has to be reachable without a
      // pointer: a role to find it by, a name to announce, and a tab stop to land on.
      expect(slot().getAttribute('tabindex')).toBe('0');
      expect(slot().getAttribute('data-brick-id')).toBe('r1');
    });

    it('falls back to the description when the entry has no name', () => {
      render(<BrickSlot brick={{ ...NOTE, name: '' }} />);

      expect(screen.getByRole('button', { name: 'play a note' })).toBeDefined();
    });
  });

  describe('interaction', () => {
    it('places the brick when the slot is clicked', () => {
      render(<BrickSlot brick={NOTE} />);

      fireEvent.click(slot());

      expect(place).toHaveBeenCalledTimes(1);
      expect(place).toHaveBeenCalledWith(NOTE);
    });

    it('places the brick on Enter', () => {
      render(<BrickSlot brick={NOTE} />);

      fireEvent.keyDown(slot(), { key: 'Enter' });

      expect(place).toHaveBeenCalledTimes(1);
      expect(place).toHaveBeenCalledWith(NOTE);
    });

    it('places the brick on Space', () => {
      render(<BrickSlot brick={NOTE} />);

      fireEvent.keyDown(slot(), { key: ' ' });

      expect(place).toHaveBeenCalledTimes(1);
    });

    it('swallows the Space keypress so the palette does not scroll under it', () => {
      render(<BrickSlot brick={NOTE} />);

      // fireEvent returns false once the handler has called preventDefault.
      expect(fireEvent.keyDown(slot(), { key: ' ' })).toBe(false);
    });

    it('ignores keys that are not Enter or Space', () => {
      render(<BrickSlot brick={NOTE} />);

      fireEvent.keyDown(slot(), { key: 'a' });
      fireEvent.keyDown(slot(), { key: 'Tab' });
      fireEvent.keyDown(slot(), { key: 'Escape' });

      expect(place).not.toHaveBeenCalled();
    });

    it('places one brick per click rather than one per slot lifetime', () => {
      render(<BrickSlot brick={NOTE} />);

      fireEvent.click(slot());
      fireEvent.click(slot());
      fireEvent.click(slot());

      expect(place).toHaveBeenCalledTimes(3);
    });
  });

  describe('drag-to-click suppression', () => {
    // interact.js fires a trailing click after a drag releases, which would place a second brick
    // on top of the one just dropped. The slot guards on the drag store: the live `dragged` entry
    // covers the in-flight case, and `lastDragEndTime` covers the 250ms after release. Only Date
    // is faked here — faking rAF too would stop the brick preview from rendering.
    const T0 = new Date('2026-01-01T00:00:00Z').getTime();

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(T0);
    });

    it('ignores a click while a palette drag is in flight', () => {
      render(<BrickSlot brick={NOTE} />);
      act(() => usePaletteDragStore.setState({ dragged: NOTE, lastDragEndTime: 0 }));

      fireEvent.click(slot());

      expect(place).not.toHaveBeenCalled();
    });

    it('ignores the click that trails a drag release', () => {
      render(<BrickSlot brick={NOTE} />);
      act(() => usePaletteDragStore.setState({ dragged: null, lastDragEndTime: T0 }));

      fireEvent.click(slot());

      expect(place).not.toHaveBeenCalled();
    });

    it('still ignores a click one tick inside the suppression window', () => {
      render(<BrickSlot brick={NOTE} />);
      act(() => usePaletteDragStore.setState({ dragged: null, lastDragEndTime: T0 }));

      vi.setSystemTime(T0 + 249);
      fireEvent.click(slot());

      expect(place).not.toHaveBeenCalled();
    });

    it('places again once the suppression window has elapsed', () => {
      render(<BrickSlot brick={NOTE} />);
      act(() => usePaletteDragStore.setState({ dragged: null, lastDragEndTime: T0 }));

      vi.setSystemTime(T0 + 250);
      fireEvent.click(slot());

      expect(place).toHaveBeenCalledTimes(1);
    });

    it('does not suppress a click after a drag that never moved', () => {
      render(<BrickSlot brick={NOTE} />);
      // `endDrag(false)` parks the timestamp at 0, so a press that never became a drag still
      // places — that press is the click-to-place gesture itself.
      act(() => usePaletteDragStore.getState().startDrag(NOTE));
      act(() => usePaletteDragStore.getState().endDrag(false));

      fireEvent.click(slot());

      expect(place).toHaveBeenCalledTimes(1);
    });

    it('suppresses the click after a drag that did move', () => {
      render(<BrickSlot brick={NOTE} />);
      act(() => usePaletteDragStore.getState().startDrag(NOTE));
      act(() => usePaletteDragStore.getState().endDrag(true));

      fireEvent.click(slot());

      expect(place).not.toHaveBeenCalled();
    });
  });
});
