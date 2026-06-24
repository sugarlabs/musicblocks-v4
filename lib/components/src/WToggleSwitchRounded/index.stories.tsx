import type { Meta, StoryObj } from '@storybook/react-vite';

import { fn } from 'storybook/test';
import { WToggleSwitchRounded } from '../..';

// -------------------------------------------------------------------------------------------------

export default {
  title: 'Common/WToggleSwitchRounded',
  component: WToggleSwitchRounded,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof WToggleSwitchRounded>;

type Story = StoryObj<typeof WToggleSwitchRounded>;

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
