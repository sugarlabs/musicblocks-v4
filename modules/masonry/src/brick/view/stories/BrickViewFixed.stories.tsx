import type { Meta, StoryObj } from '@storybook/react';

import { BrickViewFixed } from '../components/BrickViewFixed';

const meta = {
  title: 'BRICKS/BrickViewFixed',
  component: BrickViewFixed,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    scaleLevel: {
      control: { type: 'radio' },
      options: [1, 2, 3],
    },
  },
} satisfies Meta<typeof BrickViewFixed>;

export default meta;
type Story = StoryObj<typeof meta>;

// Triadic palette: three hues ~120° apart so the bricks read as clearly
// distinct, while each pair (background/foreground) clears WCAG AA (≥4.5:1)
// for legible labels. Border is a darker shade of its background.
// Triadic palette: three hues ~120° apart so the bricks read as clearly
// distinct, while each background/foreground pair clears WCAG AA (≥4.5:1)
// for legible labels. Border is a darker shade of its background.
const INDIGO = {
  background: '#4f46e5',
  foreground: '#ffffff',
  border: '#4338ca',
};

const TEAL = {
  background: '#0d9488',
  foreground: '#ffffff',
  border: '#0f766e',
};

const AMBER = {
  background: '#f59e0b',
  foreground: '#1f2937',
  border: '#d97706',
};

export const ValueDisplayWidget: Story = {
  args: {
    kind: 'value',
    colorsDefault: INDIGO,
    widget: {
      type: 'label',
      text: 'Variable',
    },
  },
};

export const ExpressionWithParams: Story = {
  args: {
    kind: 'expression',
    colorsDefault: TEAL,
    widget: {
      type: 'label',
      text: 'Add',
    },
    paramArgs: [
      {
        param: 'A',
        argDims: { w: 40, h: 20 },
      },
      {
        param: 'B',
        argDims: { w: 40, h: 20 },
      },
    ],
  },
};

export const StatementWithNesting: Story = {
  args: {
    kind: 'statement',
    colorsDefault: AMBER,
    widget: {
      type: 'label',
      text: 'Repeat',
    },
    hasConnectionPrev: true,
    hasConnectionNext: true,
    paramArgs: [
      {
        param: 'times',
        argDims: { w: 30, h: 20 },
      },
    ],
    nesting: {
      dims: { w: 100, h: 60 },
      isFolded: false,
    },
  },
};

export const StatementWithoutNesting: Story = {
  args: {
    kind: 'statement',
    colorsDefault: INDIGO,
    widget: {
      type: 'label',
      text: 'Simple Statement',
    },
    hasConnectionPrev: true,
    hasConnectionNext: true,
    paramArgs: [
      {
        param: 'delay',
        argDims: { w: 40, h: 20 },
      },
    ],
    // Omit nesting entirely
  },
};
