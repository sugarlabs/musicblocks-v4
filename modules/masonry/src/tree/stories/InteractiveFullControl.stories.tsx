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

const FullControlTree: React.FC<FullControlProps> = ({
  rootType,
  numArgs,
  numNested,
  nestingDepth,
  stackCount,
  nestedBrickTypes,
}) => {
  resetFactoryCounter();
  const treeManager = new BrickTreeManager();

  const bboxArgs = Array(numArgs).fill({ w: 60, h: 20 });

  // Root Brick
  const root =
    rootType === 'Simple'
      ? createSimpleBrick({ label: 'Root Simple', bboxArgs })
      : createCompoundBrick({ label: 'Root Compound', bboxArgs });

  const tree = treeManager.createTree(root, { x: 100, y: 100 });

  // Add argument bricks (only expressions)
  for (let i = 0; i < numArgs; i++) {
    const expr = createExpressionBrick({ label: `Expr ${i + 1}` });
    treeManager.addArgumentBrick(root.uuid, expr, { x: 0, y: 0 }, i);
  }

  // Recursive compound brick builder with insertion
  const buildNestedCompound = (parentUuid: string, depth: number, label: string) => {
    const compound = createCompoundBrick({ label });

    // Add to parent first
    treeManager.addNestedBrick(parentUuid, compound, { x: 0, y: 0 });

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
      treeManager.addNestedBrick(root.uuid, simple, { x: 0, y: 0 });
    }
  }

  // Add stacked bricks
  let lastUuid = root.uuid;
  for (let i = 0; i < stackCount; i++) {
    const stacked = createSimpleBrick({ label: `Stack ${i + 1}` });
    treeManager.addBrickToTree(tree.id, stacked, lastUuid, {
      x: 100,
      y: 150 + i * 30,
    });
    lastUuid = stacked.uuid;
  }

  return <TreeView treeManager={treeManager} />;
};

const meta: Meta<typeof FullControlTree> = {
  title: 'Components/TreeView/Interactive Full Control',
  component: FullControlTree,
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
type Story = StoryObj<typeof FullControlTree>;

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
    const treeManager = new BrickTreeManager();

    // Test with different label lengths
    const shortLabel = createCompoundBrick({
      label: 'Short',
      bboxArgs: Array(3).fill({ w: 60, h: 20 }),
    });
    const longLabel = createCompoundBrick({
      label: 'Very Long Label That Should Push Args Further Right',
      bboxArgs: Array(3).fill({ w: 60, h: 20 }),
    });

    const _tree1 = treeManager.createTree(shortLabel, { x: 100, y: 50 });
    const _tree2 = treeManager.createTree(longLabel, { x: 100, y: 200 });

    // Add argument bricks to both
    for (let i = 0; i < 3; i++) {
      const expr1 = createExpressionBrick({ label: `Arg ${i + 1}` });
      const expr2 = createExpressionBrick({ label: `Arg ${i + 1}` });
      treeManager.addArgumentBrick(shortLabel.uuid, expr1, { x: 0, y: 0 }, i);
      treeManager.addArgumentBrick(longLabel.uuid, expr2, { x: 0, y: 0 }, i);
    }

    return <TreeView treeManager={treeManager} />;
  },
};
