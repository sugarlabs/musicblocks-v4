import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import TowerView from '../components/TowerView';
import TowerModel from '../../model/model';
import {
  createSimpleBrick,
  createExpressionBrick,
  createCompoundBrick,
  resetFactoryCounter,
} from '../../../brick/utils/brickFactory';

const meta: Meta<typeof TowerView> = {
  title: 'Tower/Different-layouts',
  component: TowerView,
};
export default meta;
type Story = StoryObj<typeof TowerView>;

// === Story 1: Single Simple Brick (from tree SingleBrick) ===
export const SingleBrick: Story = {
  render: () => {
    resetFactoryCounter();
    const brick = createSimpleBrick();
    const tower = new TowerModel('tower_single', brick, { x: 100, y: 100 });

    return (
      <svg width={400} height={300} style={{ background: '#f9f9f9' }}>
        <TowerView tower={tower} />
      </svg>
    );
  },
};

// === Story 2: Stacked Bricks (from tree StackedBricks) ===
export const StackedBricks: Story = {
  render: () => {
    resetFactoryCounter();
    const root = createSimpleBrick();
    const child1 = createSimpleBrick();
    const child2 = createSimpleBrick();

    const tower = new TowerModel('tower_stack', root, { x: 100, y: 100 });
    tower.addBrick(root.uuid, child1, { x: 100, y: 130 });
    tower.addBrick(child1.uuid, child2, { x: 100, y: 160 });

    return (
      <svg width={400} height={400} style={{ background: '#f9f9f9' }}>
        <TowerView tower={tower} />
      </svg>
    );
  },
};

// === Story 3: Brick with Arguments (from tree ArgumentBricks) ===
export const ArgumentBricks: Story = {
  render: () => {
    resetFactoryCounter();
    const root = createSimpleBrick({
      label: 'My Simple',
      bboxArgs: [
        { w: 60, h: 40 },
        { w: 60, h: 20 },
      ],
    });

    const arg1 = createExpressionBrick({ label: 'Expr A', bboxArgs: [{ w: 60, h: 40 }] });
    const arg2 = createExpressionBrick({ label: 'Expr B', bboxArgs: [{ w: 60, h: 20 }] });

    const tower = new TowerModel('tower_args', root, { x: 100, y: 100 });
    tower.addArgumentBrick(root.uuid, arg1, { x: 0, y: 0 }, 0);
    tower.addArgumentBrick(root.uuid, arg2, { x: 0, y: 0 }, 1);

    return (
      <svg width={500} height={300} style={{ background: '#f9f9f9' }}>
        <TowerView tower={tower} />
      </svg>
    );
  },
};

// === Story 4: Compound with Nested Children (from tree CompoundWithNested) ===
export const CompoundWithNested: Story = {
  render: () => {
    resetFactoryCounter();
    const compound = createCompoundBrick({
      label: 'Compound with Nested',
      bboxArgs: [{ w: 80, h: 40 }],
    });

    const nested1 = createSimpleBrick();
    const nested2 = createSimpleBrick();

    const tower = new TowerModel('tower_compound', compound, { x: 200, y: 100 });
    tower.addNestedBrick(compound.uuid, nested1, { x: 0, y: 0 });
    tower.addNestedBrick(compound.uuid, nested2, { x: 0, y: 0 });

    return (
      <svg width={500} height={400} style={{ background: '#f9f9f9' }}>
        <TowerView tower={tower} />
      </svg>
    );
  },
};

// === Story 5: Full Composite Tower (from tree FullCompositeTree) ===
export const FullCompositeTower: Story = {
  render: () => {
    resetFactoryCounter();
    const compound = createCompoundBrick({
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

    const tower = new TowerModel('tower_full', compound, { x: 100, y: 100 });
    tower.addArgumentBrick(compound.uuid, arg1, { x: 0, y: 0 }, 0);
    tower.addArgumentBrick(compound.uuid, arg2, { x: 0, y: 0 }, 1);
    tower.addNestedBrick(compound.uuid, nested, { x: 0, y: 0 });
    tower.addBrick(compound.uuid, stacked, { x: 100, y: 160 });

    return (
      <svg width={600} height={500} style={{ background: '#f9f9f9' }}>
        <TowerView tower={tower} />
      </svg>
    );
  },
};
