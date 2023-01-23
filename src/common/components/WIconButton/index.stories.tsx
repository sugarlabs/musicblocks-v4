import type { Meta, StoryObj } from '@storybook/react';

import { linkTo } from '@storybook/addon-links';
import { default as WIconButton } from '.';
// -------------------------------------------------------------------------------------------------

export default {
  title: 'Common/WIconButton',
  component: WIconButton,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof WIconButton>;

type Story = StoryObj<typeof WIconButton>;

// -------------------------------------------------------------------------------------------------

export const Big: Story = {
  args: {
    big:true,
    handlerClick: linkTo('Common/WIconButton', 'Big'),
  },
};

export const Small: Story = {
  args: {
    big:false,
    handlerClick: linkTo('Common/WIconButton', 'Small'),
  },
};
