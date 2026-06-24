import type { Meta, StoryObj } from '@storybook/react-vite';

import { fn } from 'storybook/test';
import { default as WCheckbox } from '.';

// -------------------------------------------------------------------------------------------------

export default {
  title: 'Common/WCheckbox',
  component: WCheckbox,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof WCheckbox>;

type Story = StoryObj<typeof WCheckbox>;

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
