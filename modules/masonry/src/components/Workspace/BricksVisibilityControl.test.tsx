import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useWorkspaceStore } from '@/stores/workspace';
import { BricksVisibilityControl } from './BricksVisibilityControl';

afterEach(() => {
  cleanup();
  useWorkspaceStore.setState({ areBricksHidden: false });
});

describe('BricksVisibilityControl', () => {
  it('renders a "Hide blocks" button when bricks are visible', () => {
    render(<BricksVisibilityControl />);

    expect(screen.getByRole('button', { name: 'Hide blocks' })).toBeTruthy();
  });

  it('renders a "Show blocks" button once bricks are hidden', () => {
    useWorkspaceStore.setState({ areBricksHidden: true });
    render(<BricksVisibilityControl />);

    expect(screen.getByRole('button', { name: 'Show blocks' })).toBeTruthy();
  });

  it('sets areBricksHidden to true when clicked while visible', () => {
    render(<BricksVisibilityControl />);

    fireEvent.click(screen.getByRole('button', { name: 'Hide blocks' }));

    expect(useWorkspaceStore.getState().areBricksHidden).toBe(true);
  });

  it('sets areBricksHidden to false when clicked while hidden', () => {
    useWorkspaceStore.setState({ areBricksHidden: true });
    render(<BricksVisibilityControl />);

    fireEvent.click(screen.getByRole('button', { name: 'Show blocks' }));

    expect(useWorkspaceStore.getState().areBricksHidden).toBe(false);
  });
});
