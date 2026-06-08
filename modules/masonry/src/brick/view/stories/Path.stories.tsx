import type { Meta, StoryObj } from '@storybook/react';
import { PathBrickView } from '../components/Path';

const meta: Meta<typeof PathBrickView> = {
  title: 'Bricks/Path',
  component: PathBrickView,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PathBrickView>;

export const Default: Story = {};
