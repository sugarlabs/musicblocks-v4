import type { Meta, StoryObj } from '@storybook/react';

import { BrickView } from '../components/Brick';

type StoryArgs = React.ComponentProps<typeof BrickView> & { label: string };

const meta: Meta<StoryArgs> = {
  title: 'Bricks/Brick',
  component: BrickView,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  args: {
    label: "Hello, I'm a brick!",
    kind: 'statement',
    widget: {
      type: 'label',
      text: "Hello, I'm a brick!",
    },
    nesting: {
      dims: null,
      isFolded: false,
    },
    hasConnectionPrev: true,
    hasConnectionNext: true,
  },
  render: ({ label, ...args }: StoryArgs) => (
    <BrickView
      {...(args as React.ComponentProps<typeof BrickView>)}
      widget={{ type: 'label', text: label }}
    />
  ),
};
