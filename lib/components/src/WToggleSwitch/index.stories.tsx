import type { Meta, StoryObj } from '@storybook/react';

import { linkTo } from '@storybook/addon-links';
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
    handlerClick: linkTo('Common/WToggleSwitch', 'Inactive'),
  },
};

export const Inactive: Story = {
  args: {
    active: false,
    handlerClick: linkTo('Common/WToggleSwitch', 'Active'),
  },
};
