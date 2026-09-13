import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useFullscreen } from './useFullscreen';

describe('useFullscreen', () => {
  let container: HTMLDivElement;
  let requestFullscreenMock: ReturnType<typeof vi.fn>;
  let exitFullscreenMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    requestFullscreenMock = vi.fn().mockResolvedValue(undefined);
    exitFullscreenMock = vi.fn().mockResolvedValue(undefined);

    container.requestFullscreen =
      requestFullscreenMock as unknown as typeof container.requestFullscreen;
    document.exitFullscreen = exitFullscreenMock as unknown as typeof document.exitFullscreen;
  });

  afterEach(() => {
    cleanup();
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
      writable: true,
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it('initializes with isFullscreen as false', () => {
    const ref = { current: container };
    const { result } = renderHook(() => useFullscreen(ref));

    expect(result.current.isFullscreen).toBe(false);
  });

  it('initializes with isFullscreen as true if ref element is already in fullscreen on mount', () => {
    Object.defineProperty(document, 'fullscreenElement', {
      value: container,
      configurable: true,
      writable: true,
    });
    const ref = { current: container };
    const { result } = renderHook(() => useFullscreen(ref));

    expect(result.current.isFullscreen).toBe(true);
  });

  it('requests fullscreen on ref element when toggle is called and not in fullscreen', () => {
    const ref = { current: container };
    const { result } = renderHook(() => useFullscreen(ref));

    act(() => {
      result.current.toggle();
    });

    expect(requestFullscreenMock).toHaveBeenCalledOnce();
    expect(exitFullscreenMock).not.toHaveBeenCalled();
  });

  it('exits fullscreen when toggle is called while in fullscreen', () => {
    const ref = { current: container };
    Object.defineProperty(document, 'fullscreenElement', {
      value: container,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useFullscreen(ref));

    act(() => {
      result.current.toggle();
    });

    expect(exitFullscreenMock).toHaveBeenCalledOnce();
    expect(requestFullscreenMock).not.toHaveBeenCalled();
  });

  it('tracks fullscreen state off the real fullscreenchange event', () => {
    const ref = { current: container };
    const { result } = renderHook(() => useFullscreen(ref));

    expect(result.current.isFullscreen).toBe(false);

    // Simulate entering fullscreen
    Object.defineProperty(document, 'fullscreenElement', {
      value: container,
      configurable: true,
      writable: true,
    });
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(result.current.isFullscreen).toBe(true);

    // Simulate exiting fullscreen via Esc / browser
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
      writable: true,
    });
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(result.current.isFullscreen).toBe(false);
  });

  it('does not mark fullscreen if another element enters fullscreen', () => {
    const otherElement = document.createElement('div');
    document.body.appendChild(otherElement);

    const ref = { current: container };
    const { result } = renderHook(() => useFullscreen(ref));

    Object.defineProperty(document, 'fullscreenElement', {
      value: otherElement,
      configurable: true,
      writable: true,
    });
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(result.current.isFullscreen).toBe(false);
    otherElement.remove();
  });

  it('cleans up fullscreenchange listener on unmount', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    const ref = { current: container };
    const { unmount } = renderHook(() => useFullscreen(ref));

    const handler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'fullscreenchange',
    )?.[1];

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('fullscreenchange', handler);
  });
});
