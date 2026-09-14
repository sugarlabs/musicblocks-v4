import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FullscreenControl } from './FullscreenControl';

describe('FullscreenControl', () => {
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

  it('renders with "Enter fullscreen" accessible name and aria-pressed=false initially', () => {
    render(<FullscreenControl />);

    const button = screen.getByRole('button', { name: 'Enter fullscreen' });
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('calls requestFullscreen on the page root when clicked', () => {
    render(<FullscreenControl />);

    const button = screen.getByRole('button', { name: 'Enter fullscreen' });
    fireEvent.click(button);

    expect(requestFullscreenMock).toHaveBeenCalledOnce();
    // aria-pressed shouldn't flip immediately before fullscreenchange event
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('updates aria-label and aria-pressed when fullscreenchange event fires', () => {
    render(<FullscreenControl />);

    // Trigger entering fullscreen
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.documentElement,
      configurable: true,
      writable: true,
    });
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    const exitButton = screen.getByRole('button', { name: 'Exit fullscreen' });
    expect(exitButton).toBeTruthy();
    expect(exitButton.getAttribute('aria-pressed')).toBe('true');

    // Trigger exit fullscreen via Esc or browser event
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
      writable: true,
    });
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    const enterButton = screen.getByRole('button', { name: 'Enter fullscreen' });
    expect(enterButton).toBeTruthy();
    expect(enterButton.getAttribute('aria-pressed')).toBe('false');
  });

  it('calls document.exitFullscreen when clicked while in fullscreen', () => {
    render(<FullscreenControl />);

    Object.defineProperty(document, 'fullscreenElement', {
      value: document.documentElement,
      configurable: true,
      writable: true,
    });
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    const button = screen.getByRole('button', { name: 'Exit fullscreen' });
    fireEvent.click(button);

    expect(exitFullscreenMock).toHaveBeenCalledOnce();
  });

  it('renders nothing where the browser has no fullscreen to give', () => {
    // iOS Safari, or a frame embedded without `allow="fullscreen"`. A button whose only outcome is
    // a refusal is worse than no button, and it would hold a slot in the control row for nothing.
    Reflect.deleteProperty(document.documentElement, 'requestFullscreen');

    const { container } = render(<FullscreenControl />);

    expect(container.querySelector('button')).toBeNull();
  });

  it('renders nothing where a permissions policy has fullscreen turned off', () => {
    Object.defineProperty(document, 'fullscreenEnabled', {
      value: false,
      configurable: true,
      writable: true,
    });

    const { container } = render(<FullscreenControl />);

    expect(container.querySelector('button')).toBeNull();
  });
});
