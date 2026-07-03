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
    // The palette has no width of its own — it fills its container. A ~320px-wide box mirrors a
    // real side panel and shows the component adapting to a narrow width.
    <div className="bg-muted/30 flex h-screen justify-center p-4">
      <div className="h-full w-[320px]">
        <Palette config={mockPaletteConfig} />
      </div>
    </div>
  ),
};
