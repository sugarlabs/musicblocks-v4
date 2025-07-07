import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import WorkspaceView from '../components/WorkspaceView';
import WorkspaceManager from '../../model/model';

import {
  createSimpleBrick,
  createExpressionBrick,
  createCompoundBrick,
  resetFactoryCounter,
} from '../../../brick/utils/brickFactory';

type RootType = 'Simple' | 'Compound';
type BrickType = 'Simple' | 'Compound';

type InteractiveWorkspaceProps = {
  numTowers: number;
  rootType: RootType;
  numArgs: number;
  numNested: number;
  stackCount: number;
  nestedBrickTypes: BrickType[];
};

const InteractiveWorkspace: React.FC<InteractiveWorkspaceProps> = ({
  numTowers,
  rootType,
  numArgs,
  numNested,
  stackCount,
  nestedBrickTypes,
}) => {
  resetFactoryCounter();
  const manager = new WorkspaceManager();

  // Create multiple towers based on configuration
  for (let towerIndex = 0; towerIndex < numTowers; towerIndex++) {
    const xOffset = (towerIndex % 3) * 300 + 100;
    const yOffset = Math.floor(towerIndex / 3) * 400 + 100;

    const bboxArgs = Array(numArgs).fill({ w: 60, h: 20 });

    // Root Brick
    const root =
      rootType === 'Simple'
        ? createSimpleBrick({ label: `Tower ${towerIndex + 1} Root`, bboxArgs })
        : createCompoundBrick({ label: `Tower ${towerIndex + 1} Root`, bboxArgs });

    const tower = manager.createTower(root, { x: xOffset, y: yOffset });

    // Add argument bricks (only expressions)
    for (let i = 0; i < numArgs; i++) {
      const expr = createExpressionBrick({ label: `Arg ${i + 1}` });
      tower.addArgumentBrick(root.uuid, expr, { x: 0, y: 0 }, i);
    }

    // Add nested bricks (for compound only)
    if (root.type === 'Compound') {
      for (let i = 0; i < numNested; i++) {
        const nestedType = nestedBrickTypes[i % nestedBrickTypes.length] || 'Simple';
        const nested =
          nestedType === 'Simple'
            ? createSimpleBrick({ label: `Nested ${i + 1}` })
            : createCompoundBrick({ label: `Nested ${i + 1}` });
        tower.addNestedBrick(root.uuid, nested, { x: 0, y: 0 });
      }
    }

    // Add stacked bricks
    let currentParent = root;
    for (let i = 0; i < stackCount; i++) {
      const stacked = createSimpleBrick({ label: `Stack ${i + 1}` });
      tower.addBrick(currentParent.uuid, stacked, { x: 0, y: 0 });
      currentParent = stacked;
    }
  }

  return <WorkspaceView manager={manager} />;
};

const meta: Meta<typeof InteractiveWorkspace> = {
  title: 'Workspace/Interactive',
  component: InteractiveWorkspace,
  argTypes: {
    numTowers: {
      control: { type: 'range', min: 1, max: 9 },
      description: 'Number of towers to create',
    },
    rootType: {
      control: { type: 'select' },
      options: ['Simple', 'Compound'],
      description: 'Type of root brick for each tower',
    },
    numArgs: {
      control: { type: 'range', min: 0, max: 4 },
      description: 'Number of argument slots per root brick',
    },
    numNested: {
      control: { type: 'range', min: 0, max: 4 },
      description: 'Number of nested bricks (for compound only)',
    },
    stackCount: {
      control: { type: 'range', min: 0, max: 4 },
      description: 'Depth of stacked bricks below root',
    },
    nestedBrickTypes: {
      control: { type: 'check' },
      options: ['Simple', 'Compound'],
      description: 'Types of nested bricks to use',
    },
  },
};

export default meta;
type Story = StoryObj<typeof InteractiveWorkspace>;

export const SimpleWorkspace: Story = {
  args: {
    numTowers: 2,
    rootType: 'Simple',
    numArgs: 1,
    numNested: 0,
    stackCount: 2,
    nestedBrickTypes: ['Simple'],
  },
};

export const ComplexWorkspace: Story = {
  args: {
    numTowers: 6,
    rootType: 'Compound',
    numArgs: 3,
    numNested: 3,
    stackCount: 2,
    nestedBrickTypes: ['Simple', 'Compound'],
  },
};
