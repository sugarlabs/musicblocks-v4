import type { Meta, StoryObj } from '@storybook/react-vite';

import type { TowerNode } from '@/@types/tower.types';

import { TowerView } from './Tower';

const meta: Meta = {
  title: 'Tower/Tower View',
  component: TowerView,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <TowerView root={undefined as unknown as TowerNode} />,
};
