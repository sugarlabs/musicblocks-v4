import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './slider';

const meta: Meta<typeof Slider> = {
  title: 'UI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
    orientation: 'horizontal',
  },
  decorators: [
    (Story) => (
      <div className="flex h-4 w-50 items-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {};
export const Range: Story = { args: { defaultValue: [25, 75] } };
