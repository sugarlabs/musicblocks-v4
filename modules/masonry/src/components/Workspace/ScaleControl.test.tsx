// Component test for the Workspace's ScaleControl zoom buttons.
// Verifies button rendering, zoom store interactions, and boundary clamping.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DEFAULT_SCALE_LEVEL, MAX_SCALE_LEVEL, MIN_SCALE_LEVEL } from '@/utils/constants';
import { useWorkspaceScaleStore } from '@/stores/scale';

import { ScaleControl } from './ScaleControl';

afterEach(() => {
  cleanup();
  useWorkspaceScaleStore.setState({ level: DEFAULT_SCALE_LEVEL });
});

describe('ScaleControl', () => {
  it('renders zoom controls with correct accessibility labels', () => {
    render(<ScaleControl />);

    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeTruthy();
  });

  it('enables both buttons at the default scale level', () => {
    render(<ScaleControl />);

    expect((screen.getByRole('button', { name: 'Zoom in' }) as HTMLButtonElement).disabled).toBe(
      false,
    );
    expect((screen.getByRole('button', { name: 'Zoom out' }) as HTMLButtonElement).disabled).toBe(
      false,
    );
  });

  it('hides Reset zoom at the default scale level', () => {
    render(<ScaleControl />);

    expect(screen.queryByRole('button', { name: 'Reset zoom' })).toBeNull();
  });

  it('shows Reset zoom away from the default scale level', () => {
    useWorkspaceScaleStore.setState({ level: MAX_SCALE_LEVEL });
    render(<ScaleControl />);

    expect(screen.getByRole('button', { name: 'Reset zoom' })).toBeTruthy();
  });

  it('shows Reset zoom at the lowest level, where Zoom out is disabled', () => {
    useWorkspaceScaleStore.setState({ level: MIN_SCALE_LEVEL });
    render(<ScaleControl />);

    // The bound that disables a magnifier is not the default, so the reset stays the only way back.
    expect((screen.getByRole('button', { name: 'Zoom out' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect(screen.getByRole('button', { name: 'Reset zoom' })).toBeTruthy();
  });

  it('resets the scale level from below the default', () => {
    useWorkspaceScaleStore.setState({ level: MIN_SCALE_LEVEL });
    render(<ScaleControl />);

    fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }));

    expect(useWorkspaceScaleStore.getState().level).toBe(DEFAULT_SCALE_LEVEL);
  });

  it('hides Reset zoom again once the level returns to the default', () => {
    useWorkspaceScaleStore.setState({ level: MAX_SCALE_LEVEL });
    render(<ScaleControl />);

    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));

    expect(screen.queryByRole('button', { name: 'Reset zoom' })).toBeNull();
  });

  it('renders Reset zoom ahead of the magnifiers so they hold their position', () => {
    useWorkspaceScaleStore.setState({ level: MAX_SCALE_LEVEL });
    render(<ScaleControl />);

    const labels = Array.from(screen.getAllByRole('button')).map((button) =>
      button.getAttribute('aria-label'),
    );

    expect(labels).toEqual(['Reset zoom', 'Zoom out', 'Zoom in']);
  });

  it('increments scale level when Zoom In button is clicked', () => {
    render(<ScaleControl />);

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(useWorkspaceScaleStore.getState().level).toBe(DEFAULT_SCALE_LEVEL + 1);
  });

  it('decrements scale level when Zoom Out button is clicked', () => {
    render(<ScaleControl />);

    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(useWorkspaceScaleStore.getState().level).toBe(DEFAULT_SCALE_LEVEL - 1);
  });

  it('resets the scale level when Reset zoom is clicked', () => {
    useWorkspaceScaleStore.setState({ level: MAX_SCALE_LEVEL });
    render(<ScaleControl />);

    fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }));

    expect(useWorkspaceScaleStore.getState().level).toBe(DEFAULT_SCALE_LEVEL);
  });

  it('disables Zoom In button and enables Zoom Out button at MAX_SCALE_LEVEL', () => {
    useWorkspaceScaleStore.setState({ level: MAX_SCALE_LEVEL });
    render(<ScaleControl />);

    expect((screen.getByRole('button', { name: 'Zoom in' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect((screen.getByRole('button', { name: 'Zoom out' }) as HTMLButtonElement).disabled).toBe(
      false,
    );
  });

  it('disables Zoom Out button and enables Zoom In button at MIN_SCALE_LEVEL', () => {
    useWorkspaceScaleStore.setState({ level: MIN_SCALE_LEVEL });
    render(<ScaleControl />);

    expect((screen.getByRole('button', { name: 'Zoom out' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect((screen.getByRole('button', { name: 'Zoom in' }) as HTMLButtonElement).disabled).toBe(
      false,
    );
  });
});
