// Tests for the ways the action menu closes short of its brick going away. The file is .tsx so it
// runs in the dom project: the hook is all document listeners, so a rendered harness and real
// events are the only way to hold it to account.

import { cleanup, fireEvent, render } from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { useActionMenuStore } from '@/stores/actionMenu';

import { useActionMenuDismiss } from './useActionMenuDismiss';

// -------------------------------------------------------------------------------------------------

afterEach(() => {
  cleanup();
  useActionMenuStore.setState({ brickId: null });
});

/**
 * Stands in for the canvas the hook is mounted on: a menu carrying the attribute the hook tests
 * against, a brick outside it, and a brick that swallows its own pointerdown the way the fold
 * chevron does.
 */
function Harness() {
  useActionMenuDismiss();

  return (
    <div>
      <div data-action-menu data-testid="menu">
        <button data-testid="wedge">wedge</button>
      </div>
      <div data-testid="outside">outside</div>
      <div data-testid="swallower" onPointerDown={(event) => event.stopPropagation()}>
        chevron
      </div>
    </div>
  );
}

/** Mounts the harness with the menu already open on a brick. */
function openOn(brickId: string) {
  const view = render(<Harness />);

  act(() => {
    useActionMenuStore.getState().open(brickId);
  });

  return view;
}

/** The brick the store currently holds. */
function openBrick(): string | null {
  return useActionMenuStore.getState().brickId;
}

// -------------------------------------------------------------------------------------------------

describe('useActionMenuDismiss', () => {
  it('closes on Escape', () => {
    openOn('brick-1');

    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(openBrick()).toBeNull();
  });

  it('leaves the menu open on any other key', () => {
    openOn('brick-1');

    act(() => {
      fireEvent.keyDown(document, { key: 'Enter' });
    });

    expect(openBrick()).toBe('brick-1');
  });

  it('closes on a press outside the menu', () => {
    const { getByTestId } = openOn('brick-1');

    act(() => {
      fireEvent.pointerDown(getByTestId('outside'));
    });

    expect(openBrick()).toBeNull();
  });

  it('leaves the menu open on a press inside it, which its wedges own', () => {
    const { getByTestId } = openOn('brick-1');

    act(() => {
      fireEvent.pointerDown(getByTestId('wedge'));
    });

    expect(openBrick()).toBe('brick-1');
  });

  it('closes on a press that stops its own pointerdown, as the fold chevron does', () => {
    const { getByTestId } = openOn('brick-1');

    // The listener is taken in the capture phase for exactly this: a bubble-phase one would
    // never see the press, and the menu would hang over a cavity folding under it.
    act(() => {
      fireEvent.pointerDown(getByTestId('swallower'));
    });

    expect(openBrick()).toBeNull();
  });

  it('holds no listeners while the menu is closed', () => {
    render(<Harness />);

    // Nothing is open, so the hook has attached nothing; the store is written to directly to
    // prove the close came from a listener rather than the events themselves.
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
      useActionMenuStore.setState({ brickId: 'brick-1' });
    });

    expect(openBrick()).toBe('brick-1');
  });

  it('drops its listeners when the canvas unmounts', () => {
    const { unmount } = openOn('brick-1');

    unmount();

    act(() => {
      useActionMenuStore.setState({ brickId: 'brick-1' });
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(openBrick()).toBe('brick-1');
  });
});
