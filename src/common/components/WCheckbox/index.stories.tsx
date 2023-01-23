import type { Meta, StoryObj } from '@storybook/react';

import { linkTo } from '@storybook/addon-links';
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
    handlerClick: linkTo('Common/WCheckbox', 'Inactive'),
  },
};

export const Inactive: Story = {
  args: {
    active: false,
    handlerClick: linkTo('Common/WCheckbox', 'Active'),
  },
};
