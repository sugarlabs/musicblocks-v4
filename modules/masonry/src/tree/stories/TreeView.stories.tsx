// TreeView.stories.tsx
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import TreeView from '../view/TreeView';
import BrickTreeManager from '../model/model';

import {
  createSimpleBrick,
  createExpressionBrick,
  createCompoundBrick,
  resetFactoryCounter,
} from '../../brick/utils/brickFactory';

const meta: Meta<typeof TreeView> = {
  title: 'Components/TreeView/different layouts',
  component: TreeView,
};

export default meta;
type Story = StoryObj<typeof TreeView>;

// === Story 1: Single Simple Brick ===
export const SingleBrick: Story = {
  render: () => {
    resetFactoryCounter();
    const treeManager = new BrickTreeManager();
    const brick = createSimpleBrick();
    treeManager.createTree(brick, { x: 100, y: 100 });
    return <TreeView treeManager={treeManager} />;
  },
};

// === Story 2: Stacked Bricks ===
export const StackedBricks: Story = {
  render: () => {
    resetFactoryCounter();
    const treeManager = new BrickTreeManager();
    const root = createSimpleBrick();
    const child1 = createSimpleBrick();
    const child2 = createSimpleBrick();

    const tree = treeManager.createTree(root, { x: 100, y: 100 });
    treeManager.addBrickToTree(tree.id, child1, root.uuid, { x: 100, y: 130 });
    treeManager.addBrickToTree(tree.id, child2, child1.uuid, { x: 100, y: 160 });

    return <TreeView treeManager={treeManager} />;
  },
};

// === Story 3: Brick with Arguments ===
export const ArgumentBricks: Story = {
  render: () => {
    resetFactoryCounter();
    const treeManager = new BrickTreeManager();
    const root = createSimpleBrick({
      label: "My Simple",
      bboxArgs: [{ w: 60, h: 40 }, { w: 60, h: 20 }],
    });

    const arg1 = createExpressionBrick({ label: "Expr A" , bboxArgs: [{ w: 60, h: 40 }],});
    const arg2 = createExpressionBrick({ label: "Expr B" , bboxArgs: [{ w: 60, h: 20 }],});

    treeManager.createTree(root, { x: 100, y: 100 });
    treeManager.addArgumentBrick(root.uuid, arg1, { x: 0, y: 0 }, 0);
    treeManager.addArgumentBrick(root.uuid, arg2, { x: 0, y: 0 }, 1);

    return <TreeView treeManager={treeManager} />;
  },
};

// === Story 4: Compound with Nested Children ===
export const CompoundWithNested: Story = {
  render: () => {
    resetFactoryCounter();
    const treeManager = new BrickTreeManager();

    const compound = createCompoundBrick({
      label: "Compound with Nested",
      bboxArgs: [{ w: 80, h: 40 }],
    });

    const nested1 = createSimpleBrick();
    const nested2 = createSimpleBrick();

    treeManager.createTree(compound, { x: 200, y: 100 });
    treeManager.addNestedBrick(compound.uuid, nested1, { x: 0, y: 0 });
    treeManager.addNestedBrick(compound.uuid, nested2, { x: 0, y: 0 });

    return <TreeView treeManager={treeManager} />;
  },
};

// === Story 5: Full Tree - Compound + Args + Stack ===
export const FullCompositeTree: Story = {
  render: () => {
    resetFactoryCounter();
    const treeManager = new BrickTreeManager();

    const compound = createCompoundBrick({
      label: "Full Composite box with args",
      bboxArgs: [{ w: 100, h: 50 }, { w: 120, h: 70 }],
    });

    const arg1 = createExpressionBrick({ label: "Expr 1" , bboxArgs: [{ w: 100, h: 50 }],});
    const arg2 = createExpressionBrick({ label: "Expr 2" , bboxArgs: [{ w: 120, h: 70 }],});
    const nested = createSimpleBrick();
    const stacked = createSimpleBrick();

    const tree = treeManager.createTree(compound, { x: 100, y: 100 });
    treeManager.addArgumentBrick(compound.uuid, arg1, { x: 0, y: 0 }, 0);
    treeManager.addArgumentBrick(compound.uuid, arg2, { x: 0, y: 0 }, 1);
    treeManager.addNestedBrick(compound.uuid, nested, { x: 0, y: 0 });
    treeManager.addBrickToTree(tree.id, stacked, compound.uuid, { x: 100, y: 160 });

    return <TreeView treeManager={treeManager} />;
  },
};

