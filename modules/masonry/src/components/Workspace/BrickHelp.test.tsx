// Component test for the help text the pie menu's help wedge opens on a brick. The wedge itself is
// covered alongside the other wedges in ActionMenu.test.tsx; what belongs here is what the canvas
// shows once the wedge has run, and what takes it away again.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { TowerStatementNode } from '@/@types/tower.types';

import { StatementBrickModel } from '@/models/brick';
import { useBrickHelpStore } from '@/stores/brickHelp';
import { useWorkspaceStore } from '@/stores/workspace';

import { BrickHelp } from './BrickHelp';

// -------------------------------------------------------------------------------------------------

const TOOLTIP = 'Plays one note for the given duration';

afterEach(() => {
  cleanup();
  useBrickHelpStore.setState({ brickId: null });
  useWorkspaceStore.setState({ towers: {}, selectedBrickId: null });
  document.querySelectorAll('[data-tower-brick]').forEach((element) => element.remove());
});

/** Seats a one-brick tower carrying `tooltipText`, with the element the canvas would draw for it. */
function seatBrick(id: string, tooltipText: string): void {
  const node: TowerStatementNode = {
    kind: 'statement',
    model: new StatementBrickModel({
      id,
      colorsDefault: { background: '#4f46e5', foreground: '#ffffff', border: '#4338ca' },
      tooltipText,
      widget: { type: 'label', text: id },
      params: [],
      hasConnectionPrev: true,
      hasConnectionNext: true,
    }),
    prev: null,
    next: null,
    args: [],
  };

  useWorkspaceStore
    .getState()
    .createTower({ id: `tower-${id}`, root: node, position: { x: 0, y: 0 } });

  // BrickHelp measures the brick's own element, so the canvas's node has to be there to measure.
  const element = document.createElement('div');
  element.setAttribute('data-tower-brick', '');
  element.setAttribute('data-id', id);
  document.body.appendChild(element);
}

// -------------------------------------------------------------------------------------------------

describe('BrickHelp', () => {
  it('shows nothing until a brick is asked about', () => {
    seatBrick('b1', TOOLTIP);
    render(<BrickHelp />);

    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it("shows the brick's tooltip text once the help wedge has run", () => {
    seatBrick('b1', TOOLTIP);
    render(<BrickHelp />);

    act(() => {
      useBrickHelpStore.getState().show('b1');
    });

    expect(screen.getByRole('tooltip').textContent).toBe(TOOLTIP);
  });

  it('stays until dismissed, rather than following the pointer away', () => {
    seatBrick('b1', TOOLTIP);
    render(<BrickHelp />);

    act(() => {
      useBrickHelpStore.getState().show('b1');
    });
    fireEvent.pointerMove(document.body);

    expect(screen.getByRole('tooltip')).toBeTruthy();
  });

  it('dismisses on Escape', () => {
    seatBrick('b1', TOOLTIP);
    render(<BrickHelp />);

    act(() => {
      useBrickHelpStore.getState().show('b1');
    });
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(useBrickHelpStore.getState().brickId).toBeNull();
  });

  it('dismisses on a press anywhere', () => {
    seatBrick('b1', TOOLTIP);
    render(<BrickHelp />);

    act(() => {
      useBrickHelpStore.getState().show('b1');
    });
    act(() => {
      fireEvent.pointerDown(document.body);
    });

    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('shows nothing for a brick with no tooltip text', () => {
    seatBrick('b1', '');
    render(<BrickHelp />);

    act(() => {
      useBrickHelpStore.getState().show('b1');
    });

    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('closes itself when the brick it names has left the canvas', () => {
    render(<BrickHelp />);

    // No tower, so nothing on the canvas to measure against.
    act(() => {
      useBrickHelpStore.getState().show('gone');
    });

    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(useBrickHelpStore.getState().brickId).toBeNull();
  });
});
