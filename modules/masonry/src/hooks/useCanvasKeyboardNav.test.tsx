import { render, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TowerState } from '@/@types/workspace.types';
import {
  FAST_PAN_STEP,
  PAGE_PAN_STEP,
  PAN_STEP,
  useViewportStore,
} from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';
import { makeEmptyStatement } from '@/mocks/tower';

import { isInputFocused, useCanvasKeyboardNav } from './useCanvasKeyboardNav';

function KeyboardTestComponent() {
  const { handleKeyDown } = useCanvasKeyboardNav();

  return (
    <div
      data-testid="canvas-test"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
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

describe('useCanvasKeyboardNav', () => {
  beforeEach(() => {
    useViewportStore.setState({ offset: { x: 0, y: 0 } });
    useWorkspaceStore.setState({ towers: {} });
  });

  it('pans the canvas with ArrowUp, ArrowDown, ArrowLeft, and ArrowRight', () => {
    const { getByTestId } = render(<KeyboardTestComponent />);
    const canvas = getByTestId('canvas-test');

    fireEvent.keyDown(canvas, { key: 'ArrowUp' });
    expect(useViewportStore.getState().offset).toEqual({ x: 0, y: -PAN_STEP });

    fireEvent.keyDown(canvas, { key: 'ArrowDown' });
    expect(useViewportStore.getState().offset).toEqual({ x: 0, y: 0 });

    fireEvent.keyDown(canvas, { key: 'ArrowLeft' });
    expect(useViewportStore.getState().offset).toEqual({ x: -PAN_STEP, y: 0 });

    fireEvent.keyDown(canvas, { key: 'ArrowRight' });
    expect(useViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
  });

  it('pans at accelerated speed when Shift is held with arrow keys', () => {
    const { getByTestId } = render(<KeyboardTestComponent />);
    const canvas = getByTestId('canvas-test');

    fireEvent.keyDown(canvas, { key: 'ArrowUp', shiftKey: true });
    expect(useViewportStore.getState().offset).toEqual({ x: 0, y: -FAST_PAN_STEP });

    fireEvent.keyDown(canvas, { key: 'ArrowRight', shiftKey: true });
    expect(useViewportStore.getState().offset).toEqual({
      x: FAST_PAN_STEP,
      y: -FAST_PAN_STEP,
    });
  });

  it('pans large steps with PageUp and PageDown', () => {
    const { getByTestId } = render(<KeyboardTestComponent />);
    const canvas = getByTestId('canvas-test');

    fireEvent.keyDown(canvas, { key: 'PageUp' });
    expect(useViewportStore.getState().offset).toEqual({ x: 0, y: -PAGE_PAN_STEP });

    fireEvent.keyDown(canvas, { key: 'PageDown' });
    expect(useViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
  });

  it('resets the viewport offset to origin on Home', () => {
    useViewportStore.setState({ offset: { x: 500, y: -300 } });

    const { getByTestId } = render(<KeyboardTestComponent />);
    const canvas = getByTestId('canvas-test');

    fireEvent.keyDown(canvas, { key: 'Home' });
    expect(useViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
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
    expect(useViewportStore.getState().offset).toEqual({
      x: -500 + 100,
      y: -400 + 100,
    });
  });

  it('calls preventDefault for handled navigation keys and ignores unhandled keys', () => {
    const { getByTestId } = render(<KeyboardTestComponent />);
    const canvas = getByTestId('canvas-test');

    const handledEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(handledEvent, 'preventDefault');
    canvas.dispatchEvent(handledEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();

    const unhandledEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    const unhandledSpy = vi.spyOn(unhandledEvent, 'preventDefault');
    canvas.dispatchEvent(unhandledEvent);
    expect(unhandledSpy).not.toHaveBeenCalled();
  });

  describe('Focus scoping / isolation', () => {
    it('does not pan or preventDefault when typing in an input element', () => {
      const { getByTestId } = render(<KeyboardTestComponent />);
      const input = getByTestId('test-input');

      fireEvent.keyDown(input, { key: 'ArrowLeft' });
      expect(useViewportStore.getState().offset).toEqual({ x: 0, y: 0 });

      fireEvent.keyDown(input, { key: 'Home' });
      expect(useViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
    });

    it('does not pan when focused inside a textarea element', () => {
      const { getByTestId } = render(<KeyboardTestComponent />);
      const textarea = getByTestId('test-textarea');

      fireEvent.keyDown(textarea, { key: 'ArrowUp' });
      expect(useViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
    });

    it('does not pan when focused inside role=textbox or custom input slots', () => {
      const { getByTestId } = render(<KeyboardTestComponent />);
      const spanInsideTextbox = getByTestId('test-nested-span');
      const selectTrigger = getByTestId('test-select-trigger');

      fireEvent.keyDown(spanInsideTextbox, { key: 'ArrowDown' });
      expect(useViewportStore.getState().offset).toEqual({ x: 0, y: 0 });

      fireEvent.keyDown(selectTrigger, { key: 'ArrowDown' });
      expect(useViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
    });
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
  });
});
