import type { Meta, StoryObj } from '@storybook/react-vite';
import type { BrickOutlineInput } from '@/@types/brick';

import { PathBrickView } from '../components/Path';

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
      strokeWidth: 2,
      widgetDims: { w: 60, h: 18 },
      paramArgDims: [],
    },
  },
};

export const LabelArgNoParam: Story = {
  args: {
    input: {
      strokeWidth: 2,
      widgetDims: { w: 120, h: 18 },
      paramArgDims: [{ param: null, arg: { w: 100, h: 32 } }],
    },
  },
};

export const LabelArgWithParam: Story = {
  args: {
    input: {
      strokeWidth: 2,
      widgetDims: { w: 120, h: 18 },
      paramArgDims: [{ param: { w: 80, h: 18 }, arg: { w: 100, h: 32 } }],
    },
  },
};

export const LabelMixedParamArgs: Story = {
  args: {
    input: {
      strokeWidth: 2,
      widgetDims: { w: 120, h: 18 },
      paramArgDims: [
        { param: { w: 100, h: 18 }, arg: { w: 100, h: 32 } },
        { param: { w: 60, h: 18 }, arg: null },
        { param: { w: 80, h: 18 }, arg: { w: 120, h: 64 } },
        { param: null, arg: { w: 80, h: 48 } },
      ],
    },
  },
};

// ── Nesting variants (label + 2 args each with their param) ──

const nestingBase: Pick<BrickOutlineInput, 'strokeWidth' | 'widgetDims' | 'paramArgDims'> = {
  strokeWidth: 2,
  widgetDims: { w: 120, h: 18 },
  paramArgDims: [
    { param: { w: 80, h: 18 }, arg: { w: 100, h: 32 } },
    { param: { w: 60, h: 18 }, arg: { w: 80, h: 32 } },
  ],
};

export const NestingEmpty: Story = {
  args: { input: { ...nestingBase, nestingDims: null } },
};

export const NestingNarrow: Story = {
  args: { input: { ...nestingBase, nestingDims: { w: 120, h: 120 } } },
};

export const NestingWide: Story = {
  args: { input: { ...nestingBase, nestingDims: { w: 300, h: 120 } } },
};

// ── Notch variants ──

const notchBase: Pick<BrickOutlineInput, 'strokeWidth' | 'widgetDims' | 'paramArgDims'> = {
  strokeWidth: 2,
  widgetDims: { w: 120, h: 18 },
  paramArgDims: [
    { param: { w: 80, h: 18 }, arg: { w: 100, h: 32 } },
    { param: { w: 60, h: 18 }, arg: { w: 80, h: 32 } },
  ],
};

export const TopBottomNotches: Story = {
  args: {
    input: {
      ...notchBase,
      nestingDims: { w: 120, h: 120 },
      hasPrevNotch: true,
      hasNextNotch: true,
    },
  },
};

export const TopNotchOnly: Story = {
  args: {
    input: {
      ...notchBase,
      nestingDims: { w: 120, h: 120 },
      hasPrevNotch: true,
    },
  },
};

export const BottomNotchOnly: Story = {
  args: {
    input: {
      ...notchBase,
      nestingDims: { w: 120, h: 120 },
      hasNextNotch: true,
    },
  },
};

export const LeftNotchOnly: Story = {
  args: {
    input: {
      ...notchBase,
      hasOutputNotch: true,
    },
  },
};

// ── Interactive playground: drive arg count / height from Storybook controls ──

type RightNotchPlaygroundArgs = {
  argCount: number;
  arg1Height: number;
  arg2Height: number;
  arg3Height: number;
  arg4Height: number;
  arg5Height: number;
  argWidth: number;
  strokeWidth: number;
  hasOutputNotch: boolean;
};

// Drag the sliders: change how many args exist and how tall they are, and watch
// the right-edge notches re-align (one groove per arg, anchored to its slot top).
export const RightNotchPlayground: StoryObj<RightNotchPlaygroundArgs> = {
  args: {
    argCount: 3,
    arg1Height: 40,
    arg2Height: 60,
    arg3Height: 80,
    arg4Height: 40,
    arg5Height: 40,
    argWidth: 100,
    strokeWidth: 2,
    hasOutputNotch: true,
  },
  argTypes: {
    argCount: { control: { type: 'range', min: 0, max: 5, step: 1 } },
    arg1Height: { control: { type: 'range', min: 20, max: 120, step: 5 } },
    arg2Height: { control: { type: 'range', min: 20, max: 120, step: 5 } },
    arg3Height: { control: { type: 'range', min: 20, max: 120, step: 5 } },
    arg4Height: { control: { type: 'range', min: 20, max: 120, step: 5 } },
    arg5Height: { control: { type: 'range', min: 20, max: 120, step: 5 } },
    argWidth: { control: { type: 'range', min: 40, max: 160, step: 10 } },
    strokeWidth: { control: { type: 'range', min: 1, max: 6, step: 1 } },
    hasOutputNotch: { control: 'boolean' },
  },
  render: (props) => {
    // One height per argument, so each slot can be sized independently.
    const heights = [
      props.arg1Height,
      props.arg2Height,
      props.arg3Height,
      props.arg4Height,
      props.arg5Height,
    ];
    const paramArgDims = Array.from({ length: props.argCount }, (_, i) => ({
      param: null,
      arg: { w: props.argWidth, h: heights[i] },
    }));
    return (
      <PathBrickView
        input={{
          strokeWidth: props.strokeWidth,
          widgetDims: { w: 120, h: 18 },
          paramArgDims,
          nestingDims: { w: 120, h: 120 },
          hasOutputNotch: props.hasOutputNotch,
        }}
      />
    );
  },
};
