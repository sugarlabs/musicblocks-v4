import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import TowerView from '../components/TowerView';
import TowerModel from '../../model/model';

import {
  createSimpleBrick,
  createExpressionBrick,
  createCompoundBrick,
  resetFactoryCounter,
} from '../../../brick/utils/brickFactory';

type RootType = 'Simple' | 'Compound';
type BrickType = 'Simple' | 'Compound';

type FullControlProps = {
  rootType: RootType;
  numArgs: number;
  numNested: number;
  nestingDepth: number;
  stackCount: number;
  nestedBrickTypes: BrickType[];
};

const FullControlTower: React.FC<FullControlProps> = ({
  rootType,
  numArgs,
  numNested,
  nestingDepth,
  stackCount,
  nestedBrickTypes,
}) => {
  resetFactoryCounter();

  const bboxArgs = Array(numArgs).fill({ w: 60, h: 20 });

  // Root Brick
  const root =
    rootType === 'Simple'
      ? createSimpleBrick({ label: 'Root Simple', bboxArgs })
      : createCompoundBrick({ label: 'Root Compound', bboxArgs });

  const tower = new TowerModel('interactive_tower', root, { x: 100, y: 100 });

  // Add argument bricks (only expressions)
  for (let i = 0; i < numArgs; i++) {
    const expr = createExpressionBrick({ label: `Expr ${i + 1}` });
    tower.addArgumentBrick(root.uuid, expr, { x: 0, y: 0 }, i);
  }

  // Recursive compound brick builder with insertion
  const buildNestedCompound = (parentUuid: string, depth: number, label: string) => {
    const compound = createCompoundBrick({ label });

    // Add to parent first
    tower.addNestedBrick(parentUuid, compound, { x: 0, y: 0 });

    // Recursively nest further if needed
    if (depth > 1) {
      buildNestedCompound(compound.uuid, depth - 1, `${label}-Child`);
    }
  };

  // Add nested bricks based on types
  for (let i = 0; i < numNested; i++) {
    const type = nestedBrickTypes[i] || 'Simple';

    if (type === 'Compound') {
      buildNestedCompound(root.uuid, nestingDepth, `Compound ${i + 1}`);
    } else {
      const simple = createSimpleBrick({ label: `Simple ${i + 1}` });
      tower.addNestedBrick(root.uuid, simple, { x: 0, y: 0 });
    }
  }

  // Add stacked bricks
  let lastUuid = root.uuid;
  for (let i = 0; i < stackCount; i++) {
    const stacked = createSimpleBrick({ label: `Stack ${i + 1}` });
    tower.addBrick(lastUuid, stacked, {
      x: 100,
      y: 150 + i * 30,
    });
    lastUuid = stacked.uuid;
  }

  return (
    <svg width={800} height={600} style={{ background: '#f9f9f9' }}>
      <TowerView tower={tower} />
    </svg>
  );
};

const meta: Meta<typeof FullControlTower> = {
  title: 'Old/Tower/Interactive Full Control',
  component: FullControlTower,
  argTypes: {
    rootType: {
      control: 'radio',
      options: ['Simple', 'Compound'],
    },
    numArgs: {
      control: { type: 'number', min: 0, max: 5 },
    },
    numNested: {
      control: { type: 'number', min: 0, max: 5 },
    },
    nestingDepth: {
      control: { type: 'number', min: 0, max: 5 },
    },
    stackCount: {
      control: { type: 'number', min: 0, max: 5 },
    },
    nestedBrickTypes: {
      control: 'object',
      description: 'Array of "Simple" or "Compound" for each nested brick',
    },
  },
  args: {
    rootType: 'Compound',
    numArgs: 2,
    numNested: 2,
    nestingDepth: 2,
    stackCount: 1,
    nestedBrickTypes: ['Compound', 'Simple'],
  },
};

export default meta;
type Story = StoryObj<typeof FullControlTower>;

export const InteractivePlayground: Story = {};

export const TestArgumentPositioning: Story = {
  args: {
    rootType: 'Compound',
    numArgs: 3,
    numNested: 0,
    nestingDepth: 1,
    stackCount: 0,
    nestedBrickTypes: [],
  },
  render: (_args) => {
    resetFactoryCounter();

    // Test with different label lengths
    const shortLabel = createCompoundBrick({
      label: 'Short',
      bboxArgs: Array(3).fill({ w: 60, h: 20 }),
    });
    const longLabel = createCompoundBrick({
      label: 'Very Long Label That Should Push Args Further Right',
      bboxArgs: Array(3).fill({ w: 60, h: 20 }),
    });

    const tower1 = new TowerModel('tower1', shortLabel, { x: 100, y: 50 });
    const tower2 = new TowerModel('tower2', longLabel, { x: 100, y: 200 });

    // Add argument bricks to both
    for (let i = 0; i < 3; i++) {
      const expr1 = createExpressionBrick({ label: `Arg ${i + 1}` });
      const expr2 = createExpressionBrick({ label: `Arg ${i + 1}` });
      tower1.addArgumentBrick(shortLabel.uuid, expr1, { x: 0, y: 0 }, i);
      tower2.addArgumentBrick(longLabel.uuid, expr2, { x: 0, y: 0 }, i);
    }

    return (
      <svg width={800} height={600} style={{ background: '#f9f9f9' }}>
        <TowerView tower={tower1} />
        <TowerView tower={tower2} />
      </svg>
    );
  },
};
