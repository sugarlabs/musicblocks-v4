import type { Meta, StoryObj } from '@storybook/react';
import type { BrickOutlineInput } from '@masonry/@types/brick';

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

// ── Interactive playground: drive arg count / height from Storybook controls ──

function RightNotchPlaygroundView({
  argCount,
  arg1Height,
  arg2Height,
  arg3Height,
  arg4Height,
  arg5Height,
  argWidth,
  strokeWidth,
  hasLeftNotch,
}: {
  argCount: number;
  arg1Height: number;
  arg2Height: number;
  arg3Height: number;
  arg4Height: number;
  arg5Height: number;
  argWidth: number;
  strokeWidth: number;
  hasLeftNotch: boolean;
}) {
  // One height per argument, so each slot can be sized independently.
  const heights = [arg1Height, arg2Height, arg3Height, arg4Height, arg5Height];
  const paramArgDims = Array.from({ length: argCount }, (_, i) => ({
    param: null,
    arg: { w: argWidth, h: heights[i] },
  }));
  return (
    <PathBrickView
      input={{
        strokeWidth,
        labelDims: { w: 120, h: 20 },
        paramArgDims,
        nestingDims: { w: 120, h: 120 },
        hasLeftNotch,
      }}
    />
  );
}

// ── No nesting ──

export const JustLabel: Story = {
  args: {
    input: {
      strokeWidth: 2,
      labelDims: { w: 60, h: 20 },
      paramArgDims: [],
    },
  },
};

export const LabelArgNoParam: Story = {
  args: {
    input: {
      strokeWidth: 2,
      labelDims: { w: 120, h: 20 },
      paramArgDims: [{ param: null, arg: { w: 100, h: 40 } }],
    },
  },
};

export const LabelArgWithParam: Story = {
  args: {
    input: {
      strokeWidth: 2,
      labelDims: { w: 120, h: 20 },
      paramArgDims: [{ param: { w: 80, h: 20 }, arg: { w: 100, h: 40 } }],
    },
  },
};

export const LabelMixedParamArgs: Story = {
  args: {
    input: {
      strokeWidth: 2,
      labelDims: { w: 120, h: 20 },
      paramArgDims: [
        { param: { w: 100, h: 20 }, arg: { w: 100, h: 40 } },
        { param: { w: 60, h: 20 }, arg: null },
        { param: { w: 80, h: 20 }, arg: { w: 120, h: 80 } },
        { param: null, arg: { w: 80, h: 60 } },
      ],
    },
  },
};

// ── Nesting variants (label + 2 args each with their param) ──

const nestingBase: Pick<BrickOutlineInput, 'strokeWidth' | 'labelDims' | 'paramArgDims'> = {
  strokeWidth: 2,
  labelDims: { w: 120, h: 20 },
  paramArgDims: [
    { param: { w: 80, h: 20 }, arg: { w: 100, h: 40 } },
    { param: { w: 60, h: 20 }, arg: { w: 80, h: 40 } },
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
// These stories demonstrate the top / bottom notch connector tabs.
// The top notch is strokeWidth smaller than the bottom notch so they
// interlock properly when bricks are stacked.

/** Brick without nesting with only a top notch protruding upward */
export const TopNotchOnly: Story = {
  args: {
    input: {
      strokeWidth: 2,
      labelDims: { w: 60, h: 20 },
      paramArgDims: [],
      hasTopNotch: true,
      hasBottomNotch: false,
    },
  },
};

/** Brick without nesting with only a bottom notch protruding downward */
export const BottomNotchOnly: Story = {
  args: {
    input: {
      strokeWidth: 2,
      labelDims: { w: 60, h: 20 },
      paramArgDims: [],
      hasTopNotch: false,
      hasBottomNotch: true,
    },
  },
};

/** Brick without nesting with both notches — centres should be vertically aligned */
export const BothNotches: Story = {
  args: {
    input: {
      strokeWidth: 2,
      labelDims: { w: 60, h: 20 },
      paramArgDims: [],
      hasTopNotch: true,
      hasBottomNotch: true,
    },
  },
};

/** Both notches with a wider stroke to see the size difference */
export const BothNotchesWideStroke: Story = {
  args: {
    input: {
      strokeWidth: 3,

      labelDims: {
        w: 80,
        h: 20,
      },

      paramArgDims: [],
      hasTopNotch: true,
      hasBottomNotch: true,
    },
  },
};

export const NestingWithNotches: Story = {
  args: {
    input: {
      ...nestingBase,
      nestingDims: { w: 120, h: 120 },
      hasTopNotch: true,
      hasBottomNotch: true,
    },
  },
};

// ── Nested notch variants ──
// These stories demonstrate the nested-top / nested-bottom notch connectors
// that appear on the cavity roof and floor of nesting bricks.

/** Nesting brick with only a nested-top notch (smaller tab on cavity roof) */
export const NestedTopNotchOnly: Story = {
  args: {
    input: {
      ...nestingBase,
      nestingDims: { w: 120, h: 120 },
    },
  },
};

/** Nesting brick with only a nested-bottom notch (full-size groove on cavity floor) */
export const NestedBottomNotchOnly: Story = {
  args: {
    input: {
      ...nestingBase,
      nestingDims: { w: 120, h: 120 },
    },
  },
};

/** Nesting brick with both nested notches — centres should align from tail indent */
export const BothNestedNotches: Story = {
  args: {
    input: {
      ...nestingBase,
      nestingDims: { w: 120, h: 120 },
    },
  },
};

/** Nesting brick with ALL four notches (top, bottom, nestedTop, nestedBottom) */
export const AllNotches: Story = {
  args: {
    input: {
      ...nestingBase,
      nestingDims: { w: 120, h: 120 },
      hasTopNotch: true,
      hasBottomNotch: true,
    },
  },
};

/** All notches with a wider stroke to see the size differences */
export const AllNotchesWideStroke: Story = {
  args: {
    input: {
      strokeWidth: 3,

      labelDims: {
        w: 120,
        h: 20,
      },

      paramArgDims: [
        {
          param: {
            w: 80,
            h: 20,
          },

          arg: {
            w: 100,
            h: 40,
          },
        },
      ],

      nestingDims: {
        w: 120,
        h: 120,
      },

      hasTopNotch: true,
      hasBottomNotch: true,
    },
  },
};

// ── Right notch (nested brick, one groove per arg) ──

export const NestingRightNotch: Story = {
  args: {
    input: {
      strokeWidth: 2,
      labelDims: { w: 120, h: 20 },
      paramArgDims: [
        { param: null, arg: { w: 100, h: 40 } },
        { param: null, arg: { w: 100, h: 40 } },
      ],
      nestingDims: { w: 120, h: 120 },
    },
  },
};

// Three args with different heights — each notch must anchor to its own slot.
export const NestingRightNotch3Args: Story = {
  args: {
    input: {
      strokeWidth: 2,
      labelDims: { w: 120, h: 20 },
      paramArgDims: [
        { param: null, arg: { w: 100, h: 40 } },
        { param: null, arg: { w: 100, h: 80 } },
        { param: null, arg: { w: 100, h: 40 } },
      ],
      nestingDims: { w: 120, h: 120 },
    },
  },
};

// Drag the sliders: change how many args exist and how tall they are, and watch
// the right-edge notches re-align (one groove per arg, anchored to its slot top).
export const RightNotchPlayground: StoryObj<typeof RightNotchPlaygroundView> = {
  args: {
    argCount: 3,
    arg1Height: 40,
    arg2Height: 60,
    arg3Height: 80,
    arg4Height: 40,
    arg5Height: 40,
    argWidth: 100,
    strokeWidth: 2,
    hasLeftNotch: true,
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
    hasLeftNotch: { control: 'boolean' },
  },
  render: (args) => <RightNotchPlaygroundView {...args} />,
};
