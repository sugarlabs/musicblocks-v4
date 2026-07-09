import type { Meta, StoryObj } from '@storybook/react-vite';

import type { Point } from '@/@types/common.types';

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

export const WithOriginOffset: StoryObj<Point> = {
  args: { x: 300, y: 150 },
  argTypes: {
    x: { control: { type: 'number', min: 0, step: 10 } },
    y: { control: { type: 'number', min: 0, step: 10 } },
  },
  render: (args: Point) => (
    <TowerView root={statementTreeWithNesting} coords={{ x: args.x, y: args.y }} />
  ),
};
WithOriginOffset.storyName = 'Statement - with origin offset';
