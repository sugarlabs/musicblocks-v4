import type { Meta, StoryObj } from '@storybook/react-vite';

import { mockPaletteConfig } from '@/mocks/palette';

import { Workspace } from './Workspace';

const meta: Meta<typeof Workspace> = {
  title: 'Workspace/Workspace',
  component: Workspace,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    config: { palette: mockPaletteConfig },
  },
  // The workspace fills its container: palette on the left, canvas on the right. Drag a brick out
  // of the palette and drop it on the canvas to spawn a new tower at the drop point.
  decorators: [
    (Story) => (
      <div className="h-screen w-screen">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Workspace>;

export const Default: Story = {};
