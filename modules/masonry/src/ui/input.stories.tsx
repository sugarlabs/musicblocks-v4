import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  args: {
    placeholder: 'Type here...',
    disabled: false,
    type: 'text',
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Number: Story = { args: { type: 'number', placeholder: '123' } };
