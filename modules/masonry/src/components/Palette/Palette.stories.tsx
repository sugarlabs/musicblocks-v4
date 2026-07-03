import type { Meta, StoryObj } from '@storybook/react-vite';

import { mockPaletteConfig } from '@/mocks/palette';

import { Palette } from './Palette';

const meta: Meta<typeof Palette> = {
  title: 'Palette/Palette',
  component: Palette,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    config: mockPaletteConfig,
  },
  // The palette has no width of its own — it fills its container. A ~320px-wide box mirrors a real
  // side panel and shows the component adapting to a narrow width.
  decorators: [
    (Story) => (
      <div className="bg-muted/30 flex h-screen justify-center p-4">
        <div className="h-full w-[320px]">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Palette>;

export const Default: Story = {};
