import type { Meta, StoryObj } from '@storybook/react-vite';

import { fn } from 'storybook/test';
import { default as WToggleSwitch } from '.';

// -------------------------------------------------------------------------------------------------

export default {
  title: 'Common/WToggleSwitch',
  component: WToggleSwitch,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof WToggleSwitch>;

type Story = StoryObj<typeof WToggleSwitch>;

// -------------------------------------------------------------------------------------------------

export const Active: Story = {
  args: {
    active: true,
    handlerClick: fn(),
  },
};

export const Inactive: Story = {
  args: {
    active: false,
    handlerClick: fn(),
  },
};
