import type { Meta, StoryObj } from '@storybook/react';

import { BrickView } from '../components/Brick';

const meta: Meta<typeof BrickView> = {
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
type Story = StoryObj<typeof BrickView>;

export const Default: Story = {
  args: {
    label: "Hello, I'm a brick!",
  },
};
