import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useFullscreen } from './useFullscreen';

describe('useFullscreen', () => {
  let requestFullscreenMock: ReturnType<typeof vi.fn>;
  let exitFullscreenMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    requestFullscreenMock = vi.fn().mockResolvedValue(undefined);
    exitFullscreenMock = vi.fn().mockResolvedValue(undefined);

    document.documentElement.requestFullscreen =
      requestFullscreenMock as unknown as typeof document.documentElement.requestFullscreen;
    document.exitFullscreen = exitFullscreenMock as unknown as typeof document.exitFullscreen;
  });

  afterEach(() => {
    cleanup();
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
      writable: true,
    });
    // jsdom ships neither of these, so the suite hands them back the way it found them: absent.
    Reflect.deleteProperty(document, 'fullscreenEnabled');
    Reflect.deleteProperty(document.documentElement, 'requestFullscreen');
    vi.restoreAllMocks();
  });

  it('initializes with isFullscreen as false', () => {
    const { result } = renderHook(() => useFullscreen());

    expect(result.current.isFullscreen).toBe(false);
  });

  it('initializes with isFullscreen as true if the page is already in fullscreen on mount', () => {
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.documentElement,
      configurable: true,
      writable: true,
    });
    const { result } = renderHook(() => useFullscreen());

    expect(result.current.isFullscreen).toBe(true);
  });

  it('requests fullscreen on the page root when toggle is called and not in fullscreen', () => {
    const { result } = renderHook(() => useFullscreen());

    act(() => {
      result.current.toggle();
    });

    expect(requestFullscreenMock).toHaveBeenCalledOnce();
    expect(exitFullscreenMock).not.toHaveBeenCalled();
  });

  it('exits fullscreen when toggle is called while in fullscreen', () => {
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.documentElement,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useFullscreen());

    act(() => {
      result.current.toggle();
    });

    expect(exitFullscreenMock).toHaveBeenCalledOnce();
    expect(requestFullscreenMock).not.toHaveBeenCalled();
  });

  it('tracks fullscreen state off the real fullscreenchange event', () => {
    const { result } = renderHook(() => useFullscreen());

    expect(result.current.isFullscreen).toBe(false);

    // Simulate entering fullscreen
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.documentElement,
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

  it('reports the API as supported when the page can request fullscreen', () => {
    const { result } = renderHook(() => useFullscreen());

    expect(result.current.isSupported).toBe(true);
  });

  it('reports the API as unsupported where the browser has no element fullscreen', () => {
    // What iOS Safari looks like: nothing outside `<video>` can go fullscreen, so the method the
    // toggle would call through is simply not there.
    Reflect.deleteProperty(document.documentElement, 'requestFullscreen');

    const { result } = renderHook(() => useFullscreen());

    expect(result.current.isSupported).toBe(false);
  });

  it('reports the API as unsupported where a permissions policy has fullscreen turned off', () => {
    // An embedding frame without `allow="fullscreen"`: the method exists but every request is
    // refused, so the control has nothing to offer.
    Object.defineProperty(document, 'fullscreenEnabled', {
      value: false,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useFullscreen());

    expect(result.current.isSupported).toBe(false);
  });

  it('does not call through when toggled without fullscreen support', () => {
    Object.defineProperty(document, 'fullscreenEnabled', {
      value: false,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useFullscreen());

    act(() => {
      result.current.toggle();
    });

    expect(requestFullscreenMock).not.toHaveBeenCalled();
    expect(exitFullscreenMock).not.toHaveBeenCalled();
  });

  it('handles a request the browser turns down, so it never lands as an unhandled rejection', async () => {
    // How a click with no user activation behind it comes back. Left alone the rejection reaches
    // the console of an app that is behaving exactly as intended, so the toggle has to take it.
    const refused = Promise.reject(new Error('denied'));
    const catchSpy = vi.spyOn(refused, 'catch');
    requestFullscreenMock.mockReturnValue(refused);

    const { result } = renderHook(() => useFullscreen());

    act(() => {
      result.current.toggle();
    });

    expect(catchSpy).toHaveBeenCalledOnce();
    // The request never took, and `fullscreenchange` does not fire for one that did not.
    expect(result.current.isFullscreen).toBe(false);

    await refused.catch(() => {});
  });

  it('handles a rejected exit the same way', async () => {
    const refused = Promise.reject(new Error('denied'));
    const catchSpy = vi.spyOn(refused, 'catch');
    exitFullscreenMock.mockReturnValue(refused);
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.documentElement,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useFullscreen());

    act(() => {
      result.current.toggle();
    });

    expect(catchSpy).toHaveBeenCalledOnce();

    await refused.catch(() => {});
  });

  it('cleans up fullscreenchange listener on unmount', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useFullscreen());

    const handler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'fullscreenchange',
    )?.[1];

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('fullscreenchange', handler);
  });
});
