// Tests for the delayed, drag-aware tooltip a brick trigger opens. The hook is driven through a
// minimal trigger wired the way a real one is, with pointer and focus each opening it and a press
// dropping it, so these cover the behaviour every trigger inherits. What a particular trigger adds,
// such as the palette slot's accessible name, is tested with it, and the tooltip's own placement is
// tested in BrickTooltip.test.tsx.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BrickTooltip } from '@/components/Brick/BrickTooltip';

import { BRICK_TOOLTIP_DELAY_MS, useBrickTooltip } from './useBrickTooltip';

// -------------------------------------------------------------------------------------------------

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

/** A trigger wired the way the palette slot is. */
function Trigger({ text }: { text: string }) {
  const tooltip = useBrickTooltip(text);

  return (
    <>
      <button
        onPointerEnter={(event) => tooltip.show(event.currentTarget, 'pointer')}
        onPointerLeave={() => tooltip.hide('pointer')}
        onPointerDown={() => tooltip.hide()}
        onFocus={(event) => tooltip.show(event.currentTarget, 'focus')}
        onBlur={() => tooltip.hide('focus')}
      >
        trigger
      </button>
      {tooltip.anchor !== null && <BrickTooltip id="tip" text={text} anchor={tooltip.anchor} />}
    </>
  );
}

const TEXT = 'Plays one note for the given duration';
const trigger = () => screen.getByRole('button', { name: 'trigger' });

/** Runs the hover delay down inside `act`, so the tooltip's state change is flushed. */
function passTheDelay(ms = BRICK_TOOLTIP_DELAY_MS) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

// -------------------------------------------------------------------------------------------------

describe('useBrickTooltip', () => {
  describe('opening and closing', () => {
    it('opens only after the hover delay', () => {
      vi.useFakeTimers();
      render(<Trigger text={TEXT} />);

      fireEvent.pointerEnter(trigger());
      passTheDelay(BRICK_TOOLTIP_DELAY_MS - 1);
      expect(screen.queryByRole('tooltip')).toBeNull();

      passTheDelay(1);
      expect(screen.getByRole('tooltip').textContent).toBe(TEXT);
    });

    it('cancels a pending tooltip when the pointer leaves first', () => {
      vi.useFakeTimers();
      render(<Trigger text={TEXT} />);

      fireEvent.pointerEnter(trigger());
      fireEvent.pointerLeave(trigger());
      passTheDelay();

      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('opens on keyboard focus, so it is not pointer only', () => {
      vi.useFakeTimers();
      render(<Trigger text={TEXT} />);

      fireEvent.focus(trigger());
      passTheDelay();
      expect(screen.getByRole('tooltip')).toBeTruthy();

      fireEvent.blur(trigger());
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('never opens for empty text', () => {
      vi.useFakeTimers();
      render(<Trigger text="" />);

      fireEvent.pointerEnter(trigger());
      passTheDelay();

      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });

  describe('pointer and focus as independent triggers', () => {
    it('stays open when the pointer leaves a trigger that still has focus', () => {
      vi.useFakeTimers();
      render(<Trigger text={TEXT} />);

      fireEvent.focus(trigger());
      fireEvent.pointerEnter(trigger());
      passTheDelay();

      fireEvent.pointerLeave(trigger());
      expect(screen.getByRole('tooltip')).toBeTruthy();

      fireEvent.blur(trigger());
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('stays open when focus leaves a trigger the pointer still rests on', () => {
      vi.useFakeTimers();
      render(<Trigger text={TEXT} />);

      fireEvent.pointerEnter(trigger());
      fireEvent.focus(trigger());
      passTheDelay();

      fireEvent.blur(trigger());
      expect(screen.getByRole('tooltip')).toBeTruthy();

      fireEvent.pointerLeave(trigger());
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });

  describe('scroll and resize', () => {
    it('closes an open tooltip when anything scrolls, the palette list included', () => {
      vi.useFakeTimers();
      // Stands in for the palette's scrolling list: scroll does not bubble, so this checks the
      // listener hears an element's scroll and not only the window's.
      const list = document.createElement('div');
      document.body.appendChild(list);
      render(<Trigger text={TEXT} />);

      fireEvent.pointerEnter(trigger());
      passTheDelay();
      expect(screen.getByRole('tooltip')).toBeTruthy();

      act(() => {
        fireEvent.scroll(list);
      });
      expect(screen.queryByRole('tooltip')).toBeNull();
      list.remove();
    });

    it('closes an open tooltip when the window resizes', () => {
      vi.useFakeTimers();
      render(<Trigger text={TEXT} />);

      fireEvent.focus(trigger());
      passTheDelay();
      expect(screen.getByRole('tooltip')).toBeTruthy();

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('cancels a tooltip still waiting out its delay when the list scrolls under it', () => {
      vi.useFakeTimers();
      render(<Trigger text={TEXT} />);

      fireEvent.pointerEnter(trigger());
      fireEvent.scroll(document);
      passTheDelay();

      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });

  describe('Escape', () => {
    it('closes an open tooltip, even one opened by hover with focus elsewhere', () => {
      vi.useFakeTimers();
      render(<Trigger text={TEXT} />);

      fireEvent.pointerEnter(trigger());
      passTheDelay();
      expect(screen.getByRole('tooltip')).toBeTruthy();

      act(() => {
        fireEvent.keyDown(document.body, { key: 'Escape' });
      });
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('cancels a tooltip still waiting out its delay', () => {
      vi.useFakeTimers();
      render(<Trigger text={TEXT} />);

      fireEvent.pointerEnter(trigger());
      fireEvent.keyDown(document.body, { key: 'Escape' });
      passTheDelay();

      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('stays closed until the pointer arrives afresh', () => {
      vi.useFakeTimers();
      render(<Trigger text={TEXT} />);

      fireEvent.pointerEnter(trigger());
      passTheDelay();
      act(() => {
        fireEvent.keyDown(document.body, { key: 'Escape' });
      });

      // The pointer never left, and resting there does not bring it back.
      passTheDelay();
      expect(screen.queryByRole('tooltip')).toBeNull();

      fireEvent.pointerLeave(trigger());
      fireEvent.pointerEnter(trigger());
      passTheDelay();
      expect(screen.getByRole('tooltip')).toBeTruthy();
    });

    it('ignores other keys', () => {
      vi.useFakeTimers();
      render(<Trigger text={TEXT} />);

      fireEvent.pointerEnter(trigger());
      passTheDelay();
      fireEvent.keyDown(document.body, { key: 'Enter' });

      expect(screen.getByRole('tooltip')).toBeTruthy();
    });
  });

  describe('drags', () => {
    it('takes down an open tooltip when a drag starts, and keeps it down while held', () => {
      vi.useFakeTimers();
      render(<Trigger text={TEXT} />);

      fireEvent.pointerEnter(trigger());
      passTheDelay();
      expect(screen.getByRole('tooltip')).toBeTruthy();

      act(() => {
        fireEvent.pointerDown(trigger());
      });
      expect(screen.queryByRole('tooltip')).toBeNull();

      fireEvent.pointerEnter(trigger());
      passTheDelay();
      expect(screen.queryByRole('tooltip')).toBeNull();

      fireEvent.pointerUp(document.body);
    });

    it('does not open on a trigger the pointer crosses mid drag', () => {
      vi.useFakeTimers();
      render(<Trigger text={TEXT} />);

      // A drag that began elsewhere: the button is already down when the pointer arrives.
      fireEvent.pointerDown(document.body);
      fireEvent.pointerEnter(trigger());
      passTheDelay();

      expect(screen.queryByRole('tooltip')).toBeNull();
      fireEvent.pointerUp(document.body);
    });

    it('stays suppressed until the last of several pointers lifts', () => {
      vi.useFakeTimers();
      render(<Trigger text={TEXT} />);

      // A touch starts a drag, then a mouse clicks and releases elsewhere: the touch is still
      // down, so its drag is still running.
      fireEvent.pointerDown(document.body, { pointerId: 1 });
      fireEvent.pointerDown(document.body, { pointerId: 2 });
      fireEvent.pointerUp(document.body, { pointerId: 2 });

      fireEvent.pointerEnter(trigger());
      passTheDelay();
      expect(screen.queryByRole('tooltip')).toBeNull();

      fireEvent.pointerUp(document.body, { pointerId: 1 });
      fireEvent.pointerEnter(trigger());
      passTheDelay();
      expect(screen.getByRole('tooltip')).toBeTruthy();
    });
  });

  describe('a release the document never hears', () => {
    it('lets go of a pointer seen moving with no button down', () => {
      vi.useFakeTimers();
      render(<Trigger text={TEXT} />);

      // A drag let go outside the browser window: the pointerup never arrives.
      fireEvent.pointerDown(document.body, { pointerId: 7 });

      // Still moving with the button held, so still a drag.
      fireEvent.pointerMove(document.body, { pointerId: 7, buttons: 1 });
      fireEvent.pointerEnter(trigger());
      passTheDelay();
      expect(screen.queryByRole('tooltip')).toBeNull();

      // Back over the page with nothing pressed: plainly not held any more.
      fireEvent.pointerLeave(trigger());
      fireEvent.pointerMove(document.body, { pointerId: 7, buttons: 0 });
      fireEvent.pointerEnter(trigger());
      passTheDelay();
      expect(screen.getByRole('tooltip')).toBeTruthy();
    });

    it('lets go of every pointer when the window loses focus', () => {
      vi.useFakeTimers();
      render(<Trigger text={TEXT} />);

      // A touch has no hover, so a missed touch release cannot be caught by a move.
      fireEvent.pointerDown(document.body, { pointerId: 42 });
      act(() => {
        window.dispatchEvent(new Event('blur'));
      });

      fireEvent.pointerEnter(trigger());
      passTheDelay();
      expect(screen.getByRole('tooltip')).toBeTruthy();
    });
  });
});
