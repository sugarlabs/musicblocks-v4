import type { Meta, StoryObj } from '@storybook/react';

import { linkTo } from '@storybook/addon-links';
import { WToggleSwitchRounded } from '..';

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
    handlerClick: linkTo('Common/WToggleSwitchRounded', 'Inactive'),
  },
};

export const Inactive: Story = {
  args: {
    active: false,
    handlerClick: linkTo('Common/WToggleSwitchRounded', 'Active'),
  },
};
