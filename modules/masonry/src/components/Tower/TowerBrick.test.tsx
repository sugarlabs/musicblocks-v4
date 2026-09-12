// Component test for TowerBrickView's visibility rule. `isMounted`/`isPositioned`/`coords` are
// seeded directly on the brick layout store rather than going through a real layout pass, the same
// way DisconnectShadowView.test.tsx seeds its stores — this file only covers what `areBricksHidden`
// does to the `visibility` style, not layout itself.

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { makeEmptyValue } from '@/mocks/tower';
import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceStore } from '@/stores/workspace';
import { TowerBrickView } from './TowerBrick';

const NODE = makeEmptyValue('visibility-brick');

afterEach(() => {
  cleanup();
  useBrickLayoutStore.setState({ coords: {}, mounted: {}, positioned: {} });
  act(() => {
    useWorkspaceStore.setState({ areBricksHidden: false });
  });
});

/** Marks the brick mounted and positioned, the state `TowerBrickView` needs to render visibly. */
function seedLayout() {
  useBrickLayoutStore.setState({
    coords: { [NODE.model.id]: { x: 0, y: 0 } },
    mounted: { [NODE.model.id]: true },
    positioned: { [NODE.model.id]: true },
  });
}

describe('TowerBrickView', () => {
  it('is visible when positioned and bricks are not hidden', () => {
    seedLayout();

    const { container } = render(<TowerBrickView id={NODE.model.id} node={NODE} />);
    const wrapper = container.querySelector(`[data-id="${NODE.model.id}"]`) as HTMLElement;

    expect(wrapper.style.visibility).toBe('visible');
  });

  it('is hidden once areBricksHidden is set, even though it is positioned', () => {
    seedLayout();
    act(() => {
      useWorkspaceStore.getState().setBricksHidden(true);
    });

    const { container } = render(<TowerBrickView id={NODE.model.id} node={NODE} />);
    const wrapper = container.querySelector(`[data-id="${NODE.model.id}"]`) as HTMLElement;

    expect(wrapper.style.visibility).toBe('hidden');
  });

  it('goes back to visible when areBricksHidden is lifted again', () => {
    seedLayout();
    act(() => {
      useWorkspaceStore.getState().setBricksHidden(true);
    });

    const { container } = render(<TowerBrickView id={NODE.model.id} node={NODE} />);
    const wrapper = container.querySelector(`[data-id="${NODE.model.id}"]`) as HTMLElement;
    expect(wrapper.style.visibility).toBe('hidden');

    act(() => {
      useWorkspaceStore.getState().setBricksHidden(false);
    });

    expect(wrapper.style.visibility).toBe('visible');
  });

  it('stays hidden while unpositioned regardless of areBricksHidden', () => {
    // Mounted but not yet positioned — the pre-existing rule this flag is layered on top of.
    useBrickLayoutStore.setState({
      coords: { [NODE.model.id]: { x: 0, y: 0 } },
      mounted: { [NODE.model.id]: true },
      positioned: { [NODE.model.id]: false },
    });

    const { container } = render(<TowerBrickView id={NODE.model.id} node={NODE} />);
    const wrapper = container.querySelector(`[data-id="${NODE.model.id}"]`) as HTMLElement;

    expect(wrapper.style.visibility).toBe('hidden');
  });
});
