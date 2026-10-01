import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Widget } from './BrickWidget';

vi.mock('@/stores/history', () => ({
  useWorkspaceHistoryStore: { getState: () => ({ commit: vi.fn() }) },
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function textbox(value: string) {
  return (
    <Widget
      widget={{ type: 'textbox', value }}
      fontSize={16}
      lineHeight={20}
      color="#ffffff"
      borderColor="#000000"
      backgroundColor="#123456"
    />
  );
}

describe('textbox sizing', () => {
  it('keeps the measurement text and font in sync when editing, including whitespace', () => {
    vi.useFakeTimers();
    render(textbox('WWW'));
    const input = screen.getByRole('textbox') as HTMLInputElement;
    const measure = input.parentElement!.querySelector('span')!;

    expect(measure.textContent).toBe('WWW');
    expect(measure.getAttribute('aria-hidden')).toBe('true');
    expect(measure.style.fontSize).toBe(input.style.fontSize);
    // Only the span contributes intrinsic width; the input fills that measured width.
    expect(input.classList.contains('absolute')).toBe(true);
    expect(input.style.width).toBe('100%');

    fireEvent.change(input, { target: { value: 'ii  ii ' } });
    expect(measure.textContent).toBe('ii  ii ');
    expect(input.value).toBe('ii  ii ');

    fireEvent.change(input, { target: { value: '' } });
    expect(measure.textContent).toBe('\u00a0');
    expect(input.value).toBe('');
  });

  it('caps long values using the canvas width and updates the cap when the canvas resizes', () => {
    let onResize: ResizeObserverCallback;
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.spyOn(globalThis, 'ResizeObserver').mockImplementation(function (callback) {
      onResize = callback;
      return { observe, disconnect, unobserve: vi.fn() };
    });
    let canvasWidth = 320;
    const canvas = document.createElement('div');
    canvas.setAttribute('data-workspace-canvas', '');
    Object.defineProperty(canvas, 'clientWidth', { get: () => canvasWidth });
    document.body.appendChild(canvas);

    const view = render(textbox('W'.repeat(1000)), { container: canvas });
    const input = screen.getByRole('textbox') as HTMLInputElement;
    const container = input.parentElement!;
    expect(observe).toHaveBeenCalledWith(canvas);
    expect(container.style.maxWidth).toBe('256px');
    expect(input.value).toHaveLength(1000);

    canvasWidth = 200;
    act(() => onResize([], {} as ResizeObserver));
    expect(container.style.maxWidth).toBe('136px');

    canvasWidth = 800;
    act(() => onResize([], {} as ResizeObserver));
    expect(container.style.maxWidth).toBe('736px');

    view.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
    canvas.remove();
  });

  it('uses the window width outside a workspace, including after resizing', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(640);
    render(textbox('Hello'));
    const container = screen.getByRole('textbox').parentElement!;
    expect(container.style.maxWidth).toBe('576px');

    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(400);
    fireEvent(window, new Event('resize'));
    expect(container.style.maxWidth).toBe('336px');
  });
});
