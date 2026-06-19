import type { Meta, StoryObj } from '@storybook/react';

import { BrickViewFixed } from '../components/BrickViewFixed';

const meta: Meta<typeof BrickViewFixed> = {
  title: 'Bricks/BrickViewFixed',
  component: BrickViewFixed,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof BrickViewFixed>;

/** A terminal value brick — just a display label, plugs into a parent via the left notch. */
export const Value: Story = {
  args: {
    kind: 'value',
    widget: { type: 'label', text: '42' },
    colorsDefault: { background: '#f9a825', foreground: '#000000', border: '#c17900' },
    tooltipText: '',
  },
};

/** A value-producing brick with parameter labels and argument slots. */
export const Expression: Story = {
  args: {
    kind: 'expression',
    widget: { type: 'label', text: 'add' },
    paramArgs: [
      { param: 'a', argDims: { w: 48, h: 32 } },
      { param: 'b', argDims: { w: 48, h: 32 } },
    ],
    colorsDefault: { background: '#26a269', foreground: '#ffffff', border: '#1a7a4d' },
    tooltipText: '',
  },
};

/** A plain statement brick — connects above and below, no params or nesting. */
export const Statement: Story = {
  args: {
    kind: 'statement',
    widget: { type: 'label', text: 'move forward' },
    hasConnectionPrev: true,
    hasConnectionNext: true,
    colorsDefault: { background: '#4d77ff', foreground: '#ffffff', border: '#2a4bcc' },
    tooltipText: '',
  },
};

/** A compound statement brick — a parameter, an argument slot, and a nesting cavity. */
export const StatementWithNesting: Story = {
  args: {
    kind: 'statement',
    widget: { type: 'label', text: 'repeat' },
    paramArgs: [{ param: 'times', argDims: { w: 48, h: 32 } }],
    nesting: { dims: null, isFolded: false },
    hasConnectionPrev: true,
    hasConnectionNext: true,
    colorsDefault: { background: '#4d77ff', foreground: '#ffffff', border: '#2a4bcc' },
    tooltipText: '',
  },
};

type PlaygroundArgs = {
  label: string;
  scaleLevel: 1 | 2 | 3;
  argCount: number;
  hasNesting: boolean;
  isFolded: boolean;
  hasConnectionPrev: boolean;
  hasConnectionNext: boolean;
};

/** Interactive statement brick — tweak label, scale, arg count, nesting, and connections. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    label: 'repeat',
    scaleLevel: 2,
    argCount: 1,
    hasNesting: true,
    isFolded: false,
    hasConnectionPrev: true,
    hasConnectionNext: true,
  },
  argTypes: {
    label: { control: 'text' },
    scaleLevel: { control: { type: 'inline-radio' }, options: [1, 2, 3] },
    argCount: { control: { type: 'range', min: 0, max: 4, step: 1 } },
    hasNesting: { control: 'boolean' },
    isFolded: { control: 'boolean' },
    hasConnectionPrev: { control: 'boolean' },
    hasConnectionNext: { control: 'boolean' },
  },
  render: (args) => (
    <BrickViewFixed
      kind="statement"
      widget={{ type: 'label', text: args.label }}
      scaleLevel={args.scaleLevel}
      colorsDefault={{ background: '#4d77ff', foreground: '#ffffff', border: '#2a4bcc' }}
      tooltipText=""
      paramArgs={Array.from({ length: args.argCount }, (_, i) => ({
        param: `arg${i + 1}`,
        argDims: { w: 48, h: 32 },
      }))}
      nesting={args.hasNesting ? { dims: null, isFolded: args.isFolded } : undefined}
      hasConnectionPrev={args.hasConnectionPrev}
      hasConnectionNext={args.hasConnectionNext}
    />
  ),
};
