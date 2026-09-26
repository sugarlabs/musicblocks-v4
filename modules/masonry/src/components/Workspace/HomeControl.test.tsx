// Component test for the Workspace's HomeControl button.
// Verifies it is disabled at the origin, enabled away from it, and returns the canvas there.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useWorkspaceViewportStore } from '@/stores/viewport';

import { HomeControl } from './HomeControl';

afterEach(() => {
  cleanup();
  useWorkspaceViewportStore.setState({ offset: { x: 0, y: 0 } });
});

/** The home button; always rendered, so a missing one fails the test outright. */
function homeButton() {
  return screen.getByRole('button', { name: 'Reset view' }) as HTMLButtonElement;
}

describe('HomeControl', () => {
  it('renders the home button disabled while the canvas sits at the origin', () => {
    render(<HomeControl />);

    expect(homeButton().disabled).toBe(true);
  });

  it('enables the home button once the canvas has been panned', () => {
    useWorkspaceViewportStore.setState({ offset: { x: 240, y: 80 } });
    render(<HomeControl />);

    expect(homeButton().disabled).toBe(false);
  });

  it('enables the home button for a pan along a single axis', () => {
    // Either axis on its own is enough: a canvas scrolled straight down is not at the origin.
    useWorkspaceViewportStore.setState({ offset: { x: 0, y: 120 } });
    render(<HomeControl />);

    expect(homeButton().disabled).toBe(false);
  });

  it('enables as soon as a pan moves the canvas off the origin', () => {
    render(<HomeControl />);

    act(() => {
      useWorkspaceViewportStore.getState().panBy({ x: 40, y: 0 });
    });

    expect(homeButton().disabled).toBe(false);
  });

  it('stays disabled when a pan is clamped away at the origin', () => {
    render(<HomeControl />);

    // The store stops the offset at the origin, so a pan back past it changes nothing and there is
    // still nowhere to return from.
    act(() => {
      useWorkspaceViewportStore.getState().panBy({ x: -40, y: -40 });
    });

    expect(homeButton().disabled).toBe(true);
  });

  it('returns the canvas to the origin when clicked', () => {
    useWorkspaceViewportStore.setState({ offset: { x: 240, y: 80 } });
    render(<HomeControl />);

    fireEvent.click(homeButton());

    expect(useWorkspaceViewportStore.getState().offset).toEqual({ x: 0, y: 0 });
  });

  it('disables the home button again once the canvas is back at the origin', () => {
    useWorkspaceViewportStore.setState({ offset: { x: 240, y: 80 } });
    render(<HomeControl />);

    fireEvent.click(homeButton());

    expect(homeButton().disabled).toBe(true);
  });
});
