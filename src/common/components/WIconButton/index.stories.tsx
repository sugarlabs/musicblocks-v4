import type { Meta, StoryObj } from '@storybook/react';

import { default as WIconButton } from '.';

// -------------------------------------------------------------------------------------------------

export default {
  title: 'Common/WIconButton',
  component: WIconButton,
  decorators: [
    (Story) => (
      <div id="stories-button-wrapper">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      options: ['small', 'big'],
    },
  }
} as Meta<typeof WIconButton>;

type Story = StoryObj<typeof WIconButton>;

// -------------------------------------------------------------------------------------------------

export const Button: Story = {
  args: {
    content: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M27 7H5" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13 13V21" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19 13V21" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M25 7V26C25 26.2652 24.8946 26.5196 24.7071 26.7071C24.5196 26.8946 24.2652 27 24 27H8C7.73478 27 7.48043 26.8946 7.29289 26.7071C7.10536 26.5196 7 26.2652 7 26V7" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M21 7V5C21 4.46957 20.7893 3.96086 20.4142 3.58579C20.0391 3.21071 19.5304 3 19 3H13C12.4696 3 11.9609 3.21071 11.5858 3.58579C11.2107 3.96086 11 4.46957 11 5V7" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    size: 'small',
    handlerClick: () => undefined,
  },
};

export const bigButton: Story = {
  args: {
    content: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M27 7H5" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13 13V21" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19 13V21" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M25 7V26C25 26.2652 24.8946 26.5196 24.7071 26.7071C24.5196 26.8946 24.2652 27 24 27H8C7.73478 27 7.48043 26.8946 7.29289 26.7071C7.10536 26.5196 7 26.2652 7 26V7" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M21 7V5C21 4.46957 20.7893 3.96086 20.4142 3.58579C20.0391 3.21071 19.5304 3 19 3H13C12.4696 3 11.9609 3.21071 11.5858 3.58579C11.2107 3.96086 11 4.46957 11 5V7" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
     size: 'big',
    handlerClick: () => undefined,
  },
};
