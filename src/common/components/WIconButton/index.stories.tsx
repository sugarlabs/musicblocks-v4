import type { Meta, StoryObj } from '@storybook/react';

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
    handlerClick: ()=>{console.log('Big Button')},
  },
};

export const Small: Story = {
  args: {
    big:false,
    handlerClick: ()=>{console.log('Small Button')},
  },
};
