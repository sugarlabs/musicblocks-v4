import type { Meta, StoryObj } from '@storybook/react-vite';

import { mockPaletteConfig } from '@/mock/palette';

import { Palette } from './Palette';

const meta: Meta = {
  title: 'Palette/Palette',
  component: Palette,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="h-screen p-4">
      <Palette config={mockPaletteConfig} />
    </div>
  ),
};
