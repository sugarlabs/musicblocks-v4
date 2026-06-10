import type { Meta, StoryObj } from '@storybook/react';
import { PathBrickView } from '../components/Path';
import type { BrickOutlineInput2 } from '../../../@types/brick';

const meta: Meta<typeof PathBrickView> = {
  title: 'Bricks/Path',
  component: PathBrickView,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PathBrickView>;

// ── No nesting ──

export const JustLabel: Story = {
  args: {
    input: {
      strokeWidth: 4,
      labelDims: { w: 120, h: 20 },
      paramArgDims: [],
    },
  },
};

export const LabelArgNoParam: Story = {
  args: {
    input: {
      strokeWidth: 4,
      labelDims: { w: 120, h: 20 },
      paramArgDims: [{ param: null, arg: { w: 100, h: 44 } }],
    },
  },
};

export const LabelArgWithParam: Story = {
  args: {
    input: {
      strokeWidth: 4,
      labelDims: { w: 120, h: 20 },
      paramArgDims: [{ param: { w: 80, h: 15 }, arg: { w: 100, h: 44 } }],
    },
  },
};

export const LabelMixedParamArgs: Story = {
  args: {
    input: {
      strokeWidth: 4,
      labelDims: { w: 120, h: 20 },
      paramArgDims: [
        { param: { w: 100, h: 15 }, arg: { w: 100, h: 44 } },
        { param: { w: 60, h: 15 }, arg: null },
        { param: { w: 80, h: 15 }, arg: { w: 120, h: 80 } },
        { param: null, arg: { w: 80, h: 60 } },
      ],
    },
  },
};

// ── Nesting variants (label + 2 args each with their param) ──

const nestingBase: Pick<BrickOutlineInput2, 'strokeWidth' | 'labelDims' | 'paramArgDims'> = {
  strokeWidth: 4,
  labelDims: { w: 120, h: 20 },
  paramArgDims: [
    { param: { w: 80, h: 15 }, arg: { w: 100, h: 44 } },
    { param: { w: 60, h: 15 }, arg: { w: 80, h: 44 } },
  ],
};

export const NestingEmpty: Story = {
  args: { input: { ...nestingBase, nestingDims: null } },
};

export const NestingNarrow: Story = {
  args: { input: { ...nestingBase, nestingDims: { w: 80, h: 120 } } },
};

export const NestingWide: Story = {
  args: { input: { ...nestingBase, nestingDims: { w: 300, h: 120 } } },
};
