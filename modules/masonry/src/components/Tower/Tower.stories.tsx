import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  expressionTree,
  statementTreeNoNesting,
  statementTreeWithNesting,
  valueTree,
} from '@/mocks/tower';

import { TowerView } from './Tower';

const meta: Meta = {
  title: 'Tower/Tower',
  component: TowerView,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen w-screen p-3">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TowerView>;

export const Value: Story = {
  render: () => <TowerView root={valueTree} />,
};

export const Expression: Story = {
  render: () => <TowerView root={expressionTree} />,
};

export const StatementNoNesting: Story = {
  render: () => <TowerView root={statementTreeNoNesting} />,
};
StatementNoNesting.storyName = 'Statement - no nesting';

export const StatementWithNesting: Story = {
  render: () => <TowerView root={statementTreeWithNesting} />,
};
StatementWithNesting.storyName = 'Statement - with nesting';
