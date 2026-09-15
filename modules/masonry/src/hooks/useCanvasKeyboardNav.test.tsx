// Tests for the hook that pans the workspace off the keyboard. The hook listens on the window and
// hands the canvas an `onKeyDown` besides, so presses are fired at both — what is asserted is where
// the offset lands, which presses are left alone, and that the two paths never pan twice over one
// key. The file is .tsx so it runs in the dom project: the window listener is bound in an effect.

import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TowerState } from '@/@types/workspace.types';
import { makeEmptyStatement } from '@/mocks/tower';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';
import { FAST_PAN_STEP, PAGE_PAN_STEP, PAN_STEP } from '@/utils/constants';

import { isInputFocused, useCanvasKeyboardNav } from './useCanvasKeyboardNav';

// -------------------------------------------------------------------------------------------------

/** Mounts the hook on a canvas holding one of every widget the typing guard has to keep out of. */
function KeyboardTestComponent() {
  const { handleKeyDown } = useCanvasKeyboardNav();

  return (
    <div data-testid="canvas-test" tabIndex={0} onKeyDown={handleKeyDown}>
      <input data-testid="test-input" type="text" />
      <textarea data-testid="test-textarea" />
      <div role="textbox" data-testid="test-role-textbox">
        <span data-testid="test-nested-span">Editable text</span>
      </div>
      <button data-slot="select-trigger" data-testid="test-select-trigger">
        Select option
      </button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------------

describe('useCanvasKeyboardNav', () => {
  beforeEach(() => {
    useWorkspaceViewportStore.setState({ offset: { x: 0, y: 0 } });
    useWorkspaceStore.setState({ towers: {} });
  });

  it('pans the canvas with ArrowUp, ArrowDown, ArrowLeft, and ArrowRight', () => {
    const { getByTestId } = render(<KeyboardTestComponent />);
    const canvas = getByTestId('canvas-test');

    fireEvent.keyDown(canvas, { key: 'ArrowDown' });
    expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: PAN_STEP });

    fireEvent.keyDown(canvas, { key: 'ArrowUp' });
    expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });

    fireEvent.keyDown(canvas, { key: 'ArrowRight' });
    expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: PAN_STEP, y: 0 });

    fireEvent.keyDown(canvas, { key: 'ArrowLeft' });
    expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
  });

  it('pans at accelerated speed when Shift is held with arrow keys', () => {
    const { getByTestId } = render(<KeyboardTestComponent />);
    const canvas = getByTestId('canvas-test');

    fireEvent.keyDown(canvas, { key: 'ArrowDown', shiftKey: true });
    expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: FAST_PAN_STEP });

    fireEvent.keyDown(canvas, { key: 'ArrowRight', shiftKey: true });
    expect(useWorkspaceViewportStore.getState().offset).toEqual({
      x: FAST_PAN_STEP,
      y: FAST_PAN_STEP,
    });
  });

  it('pans large steps with PageUp and PageDown', () => {
    const { getByTestId } = render(<KeyboardTestComponent />);
    const canvas = getByTestId('canvas-test');

    fireEvent.keyDown(canvas, { key: 'PageDown' });
    expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: PAGE_PAN_STEP });

    fireEvent.keyDown(canvas, { key: 'PageUp' });
    expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
  });

  it('resets the viewport offset to origin on Home', () => {
    useWorkspaceViewportStore.setState({ offset: { x: 500, y: 300 } });

    const { getByTestId } = render(<KeyboardTestComponent />);
    const canvas = getByTestId('canvas-test');

    fireEvent.keyDown(canvas, { key: 'Home' });
    expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
  });

  it('pans to active tower extents on End', () => {
    const towers: Record<string, TowerState> = {
      t1: {
        id: 't1',
        position: { x: 500, y: 400 },
        root: makeEmptyStatement('s1', 0, false),
      },
    };
    useWorkspaceStore.setState({ towers });

    const { getByTestId } = render(<KeyboardTestComponent />);
    const canvas = getByTestId('canvas-test');

    fireEvent.keyDown(canvas, { key: 'End' });
    expect(useWorkspaceViewportStore.getState().offset).toEqual({
      x: 500 - 100,
      y: 400 - 100,
    });
  });

  it('calls preventDefault for handled navigation keys and ignores unhandled keys', () => {
    const { getByTestId } = render(<KeyboardTestComponent />);
    const canvas = getByTestId('canvas-test');

    const handledEvent = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(handledEvent, 'preventDefault');
    canvas.dispatchEvent(handledEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();

    const unhandledEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    const unhandledSpy = vi.spyOn(unhandledEvent, 'preventDefault');
    canvas.dispatchEvent(unhandledEvent);
    expect(unhandledSpy).not.toHaveBeenCalled();
  });

  describe('Focus scoping / isolation', () => {
    it('does not pan or preventDefault when typing in an input element', () => {
      const { getByTestId } = render(<KeyboardTestComponent />);
      const input = getByTestId('test-input');

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });

      fireEvent.keyDown(input, { key: 'Home' });
      expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
    });

    it('does not pan when focused inside a textarea element', () => {
      const { getByTestId } = render(<KeyboardTestComponent />);
      const textarea = getByTestId('test-textarea');

      fireEvent.keyDown(textarea, { key: 'ArrowDown' });
      expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
    });

    it('does not pan when focused inside role=textbox or custom input slots', () => {
      const { getByTestId } = render(<KeyboardTestComponent />);
      const spanInsideTextbox = getByTestId('test-nested-span');
      const selectTrigger = getByTestId('test-select-trigger');

      fireEvent.keyDown(spanInsideTextbox, { key: 'ArrowDown' });
      expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });

      fireEvent.keyDown(selectTrigger, { key: 'ArrowDown' });
      expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
    });
  });

  describe('window-level listening', () => {
    it('pans on a key pressed outside the canvas, since the listener sits on the window', () => {
      render(<KeyboardTestComponent />);

      // `document.body` sits above React's root container, so only the window listener sees this:
      // the canvas is never focused and its `onKeyDown` never runs.
      fireEvent.keyDown(document.body, { key: 'ArrowDown' });

      expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: PAN_STEP });
    });

    it('pans once, not twice, when the canvas has already handled the key', () => {
      const { getByTestId } = render(<KeyboardTestComponent />);
      const canvas = getByTestId('canvas-test');

      // The press runs the canvas handler and then bubbles on to the window one; the
      // `defaultPrevented` guard is all that keeps the second from panning again.
      fireEvent.keyDown(canvas, { key: 'ArrowDown' });

      expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: PAN_STEP });
    });

    it('stops listening once unmounted', () => {
      const { unmount } = render(<KeyboardTestComponent />);
      unmount();

      fireEvent.keyDown(document.body, { key: 'ArrowDown' });

      expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
    });
  });

  describe('End', () => {
    it('follows the furthest extent on each axis on its own', () => {
      const towers: Record<string, TowerState> = {
        t1: { id: 't1', position: { x: 900, y: 50 }, root: makeEmptyStatement('s1', 0, false) },
        t2: { id: 't2', position: { x: 100, y: 700 }, root: makeEmptyStatement('s2', 0, false) },
      };
      useWorkspaceStore.setState({ towers });

      const { getByTestId } = render(<KeyboardTestComponent />);
      fireEvent.keyDown(getByTestId('canvas-test'), { key: 'End' });

      // x comes off t1 and y off t2, so reading one tower rather than one extent per axis would
      // land somewhere else entirely.
      expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 800, y: 600 });
    });

    it('returns to the origin when the canvas holds no towers', () => {
      useWorkspaceViewportStore.setState({ offset: { x: 400, y: 400 } });

      const { getByTestId } = render(<KeyboardTestComponent />);
      fireEvent.keyDown(getByTestId('canvas-test'), { key: 'End' });

      expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
    });

    it('stops at the origin for a tower nearer than the margin it leaves', () => {
      const towers: Record<string, TowerState> = {
        t1: { id: 't1', position: { x: 40, y: 10 }, root: makeEmptyStatement('s1', 0, false) },
      };
      useWorkspaceStore.setState({ towers });
      useWorkspaceViewportStore.setState({ offset: { x: 300, y: 300 } });

      const { getByTestId } = render(<KeyboardTestComponent />);
      fireEvent.keyDown(getByTestId('canvas-test'), { key: 'End' });

      // Both extents sit inside the margin the pan leaves, so the target clamps at the origin
      // rather than going negative.
      expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
    });
  });

  it('leaves the offset where it is when a pan would carry it past the origin', () => {
    const { getByTestId } = render(<KeyboardTestComponent />);
    const canvas = getByTestId('canvas-test');

    fireEvent.keyDown(canvas, { key: 'ArrowUp' });
    fireEvent.keyDown(canvas, { key: 'ArrowLeft' });
    fireEvent.keyDown(canvas, { key: 'PageUp' });

    expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
  });

  it('leaves PageDown, PageUp, Home, and End at their own steps when Shift is held', () => {
    const { getByTestId } = render(<KeyboardTestComponent />);
    const canvas = getByTestId('canvas-test');

    fireEvent.keyDown(canvas, { key: 'PageDown', shiftKey: true });
    expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: PAGE_PAN_STEP });

    fireEvent.keyDown(canvas, { key: 'Home', shiftKey: true });
    expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
  });

  describe('isInputFocused', () => {
    it('identifies input elements as focused', () => {
      const input = document.createElement('input');
      const event = { target: input } as unknown as React.KeyboardEvent;
      expect(isInputFocused(event)).toBe(true);
    });

    it('identifies contentEditable elements as focused', () => {
      const div = document.createElement('div');
      div.setAttribute('contenteditable', 'true');
      const event = { target: div } as unknown as React.KeyboardEvent;
      expect(isInputFocused(event)).toBe(true);
    });

    it('returns false for standard canvas elements', () => {
      const canvasDiv = document.createElement('div');
      const event = { target: canvasDiv } as unknown as React.KeyboardEvent;
      expect(isInputFocused(event)).toBe(false);
    });

    it('identifies select elements as focused', () => {
      const event = { target: document.createElement('select') } as unknown as React.KeyboardEvent;
      expect(isInputFocused(event)).toBe(true);
    });

    it('identifies an element editable through the DOM property alone', () => {
      const div = document.createElement('div');
      // The property without the attribute, which is what a browser reports for a child that
      // inherits its `contenteditable`.
      Object.defineProperty(div, 'isContentEditable', { value: true });

      const event = { target: div } as unknown as React.KeyboardEvent;
      expect(isInputFocused(event)).toBe(true);
    });

    it('identifies a bare contenteditable attribute as focused', () => {
      const div = document.createElement('div');
      div.setAttribute('contenteditable', '');

      const event = { target: div } as unknown as React.KeyboardEvent;
      expect(isInputFocused(event)).toBe(true);
    });

    it.each([
      ['a searchbox', { role: 'searchbox' }],
      ['a combobox', { role: 'combobox' }],
      ['an input slot', { 'data-slot': 'input' }],
      ["a brick's own input", { 'data-brick-input': '' }],
    ])('identifies a target nested inside %s as focused', (_label, attributes) => {
      const wrapper = document.createElement('div');
      for (const [name, value] of Object.entries(attributes)) {
        wrapper.setAttribute(name, value);
      }
      const target = document.createElement('span');
      wrapper.append(target);

      const event = { target } as unknown as React.KeyboardEvent;
      expect(isInputFocused(event)).toBe(true);
    });

    it('returns false when the event carries no target', () => {
      const event = { target: null } as unknown as React.KeyboardEvent;
      expect(isInputFocused(event)).toBe(false);
    });

    it('returns false for a target that is not an element', () => {
      // A press that lands on the document itself: no `tagName` and no `closest`, so the guards
      // have to hold rather than throw.
      const event = { target: document } as unknown as React.KeyboardEvent;
      expect(isInputFocused(event)).toBe(false);
    });
  });
});
