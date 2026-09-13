import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FullscreenControl } from './FullscreenControl';

describe('FullscreenControl', () => {
  let containerEl: HTMLDivElement;
  let requestFullscreenMock: ReturnType<typeof vi.fn>;
  let exitFullscreenMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    containerEl = document.createElement('div');
    document.body.appendChild(containerEl);

    requestFullscreenMock = vi.fn().mockResolvedValue(undefined);
    exitFullscreenMock = vi.fn().mockResolvedValue(undefined);

    containerEl.requestFullscreen =
      requestFullscreenMock as unknown as typeof containerEl.requestFullscreen;
    document.exitFullscreen = exitFullscreenMock as unknown as typeof document.exitFullscreen;
  });

  afterEach(() => {
    cleanup();
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
      writable: true,
    });
    containerEl.remove();
    vi.restoreAllMocks();
  });

  it('renders with "Enter fullscreen" accessible name and aria-pressed=false initially', () => {
    const rootRef = { current: containerEl };
    render(<FullscreenControl rootRef={rootRef} />);

    const button = screen.getByRole('button', { name: 'Enter fullscreen' });
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('calls requestFullscreen on rootRef element when clicked', () => {
    const rootRef = { current: containerEl };
    render(<FullscreenControl rootRef={rootRef} />);

    const button = screen.getByRole('button', { name: 'Enter fullscreen' });
    fireEvent.click(button);

    expect(requestFullscreenMock).toHaveBeenCalledOnce();
    // aria-pressed shouldn't flip immediately before fullscreenchange event
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('updates aria-label and aria-pressed when fullscreenchange event fires', () => {
    const rootRef = { current: containerEl };
    render(<FullscreenControl rootRef={rootRef} />);

    // Trigger entering fullscreen
    Object.defineProperty(document, 'fullscreenElement', {
      value: containerEl,
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
    const rootRef = { current: containerEl };
    render(<FullscreenControl rootRef={rootRef} />);

    Object.defineProperty(document, 'fullscreenElement', {
      value: containerEl,
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
});
