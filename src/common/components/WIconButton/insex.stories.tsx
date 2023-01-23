import type { Meta, StoryObj } from '@storybook/react';
import { linkTo } from '@storybook/addon-links';
import WIconButton from '.';

//-------------------------------------------------------------------------------------------------


export default {
  title: 'Common/WIconButton',
  component: WIconButton,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof WIconButton>;

type Story = StoryObj<typeof WIconButton>;

//-------------------------------------------------------------------------------------------------

export const Big: Story = {
  args: {
    size: 'big',
    content: '',
    handlerClick: linkTo('Common/WIconButton', 'Small'),
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    content: '',
    handlerClick: linkTo('Common/WIconButton', 'Big'),
  },
};
