import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import WorkspaceView from '../components/WorkspaceView';
import WorkspaceManager from '../../model/model';

import {
  createSimpleBrick,
  createExpressionBrick,
  createCompoundBrick,
  resetFactoryCounter,
} from '../../../brick/utils/brickFactory';

const meta: Meta<typeof WorkspaceView> = {
  title: 'Old/Workspace/Fixed',
  component: WorkspaceView,
};
export default meta;

type Story = StoryObj<typeof WorkspaceView>;

// === Workspace Story 1: Single Tower (adapted from tree SingleBrick) ===
export const SingleTower: Story = {
  render: () => {
    resetFactoryCounter();
    const manager = new WorkspaceManager();
    const brick = createSimpleBrick();
    manager.createTower(brick, { x: 100, y: 100 });
    return <WorkspaceView manager={manager} />;
  },
};

// === Workspace Story 2: Multiple Separate Towers (adapted from tree concept) ===
export const MultipleTowers: Story = {
  render: () => {
    resetFactoryCounter();
    const manager = new WorkspaceManager();

    // Tower 1: Simple stack (like tree StackedBricks)
    const root1 = createSimpleBrick();
    const child1 = createSimpleBrick();
    const child2 = createSimpleBrick();
    const tower1 = manager.createTower(root1, { x: 100, y: 100 });
    tower1.addBrick(root1.uuid, child1, { x: 100, y: 130 });
    tower1.addBrick(child1.uuid, child2, { x: 100, y: 160 });

    // Tower 2: Arguments (like tree ArgumentBricks)
    const root2 = createSimpleBrick({
      label: 'My Simple',
      bboxArgs: [
        { w: 60, h: 40 },
        { w: 60, h: 20 },
      ],
    });
    const arg1 = createExpressionBrick({ label: 'Expr A', bboxArgs: [{ w: 60, h: 40 }] });
    const arg2 = createExpressionBrick({ label: 'Expr B', bboxArgs: [{ w: 60, h: 20 }] });
    const tower2 = manager.createTower(root2, { x: 400, y: 100 });
    tower2.addArgumentBrick(root2.uuid, arg1, { x: 0, y: 0 }, 0);
    tower2.addArgumentBrick(root2.uuid, arg2, { x: 0, y: 0 }, 1);

    // Tower 3: Compound with nested (like tree CompoundWithNested)
    const compound = createCompoundBrick({
      label: 'Compound with Nested',
      bboxArgs: [{ w: 80, h: 40 }],
    });
    const nested1 = createSimpleBrick();
    const nested2 = createSimpleBrick();
    const tower3 = manager.createTower(compound, { x: 700, y: 100 });
    tower3.addNestedBrick(compound.uuid, nested1, { x: 0, y: 0 });
    tower3.addNestedBrick(compound.uuid, nested2, { x: 0, y: 0 });

    return <WorkspaceView manager={manager} />;
  },
};

// === Workspace Story 3: Full Composite Workspace (adapted from tree FullCompositeTree) ===
export const FullCompositeWorkspace: Story = {
  render: () => {
    resetFactoryCounter();
    const manager = new WorkspaceManager();

    // Tower 1: Full composite (like tree FullCompositeTree)
    const compound1 = createCompoundBrick({
      label: 'Full Composite box with args',
      bboxArgs: [
        { w: 100, h: 50 },
        { w: 120, h: 70 },
      ],
    });
    const arg1 = createExpressionBrick({ label: 'Expr 1', bboxArgs: [{ w: 100, h: 50 }] });
    const arg2 = createExpressionBrick({ label: 'Expr 2', bboxArgs: [{ w: 120, h: 70 }] });
    const nested = createSimpleBrick();
    const stacked = createSimpleBrick();
    const tower1 = manager.createTower(compound1, { x: 100, y: 100 });
    tower1.addArgumentBrick(compound1.uuid, arg1, { x: 0, y: 0 }, 0);
    tower1.addArgumentBrick(compound1.uuid, arg2, { x: 0, y: 0 }, 1);
    tower1.addNestedBrick(compound1.uuid, nested, { x: 0, y: 0 });
    tower1.addBrick(compound1.uuid, stacked, { x: 100, y: 160 });

    // Tower 2: Another compound
    const compound2 = createCompoundBrick({
      label: 'Second Compound',
      bboxArgs: [{ w: 80, h: 40 }],
    });
    const tower2 = manager.createTower(compound2, { x: 500, y: 200 });
    tower2.addNestedBrick(compound2.uuid, createSimpleBrick(), { x: 0, y: 0 });

    return <WorkspaceView manager={manager} />;
  },
};

// === Workspace Story 4: Argument Positioning Test (adapted from tree TestArgumentPositioning) ===
export const TestArgumentPositioning: Story = {
  render: () => {
    resetFactoryCounter();
    const manager = new WorkspaceManager();

    // Test with different label lengths
    const shortLabel = createCompoundBrick({
      label: 'Short',
      bboxArgs: Array(3).fill({ w: 60, h: 20 }),
    });
    const longLabel = createCompoundBrick({
      label: 'Very Long Label That Should Push Args Further Right',
      bboxArgs: Array(3).fill({ w: 60, h: 20 }),
    });

    const tower1 = manager.createTower(shortLabel, { x: 100, y: 50 });
    const tower2 = manager.createTower(longLabel, { x: 100, y: 200 });

    // Add argument bricks to both
    for (let i = 0; i < 3; i++) {
      const expr1 = createExpressionBrick({ label: `Arg ${i + 1}` });
      const expr2 = createExpressionBrick({ label: `Arg ${i + 1}` });
      tower1.addArgumentBrick(shortLabel.uuid, expr1, { x: 0, y: 0 }, i);
      tower2.addArgumentBrick(longLabel.uuid, expr2, { x: 0, y: 0 }, i);
    }

    return <WorkspaceView manager={manager} />;
  },
};
