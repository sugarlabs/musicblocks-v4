import { useEffect, useState } from 'react';
import { Copy, Scissors, Trash2 } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import type { ActionMenuWedge } from '@/@types/action-menu.types';
import type { TowerStatementNode } from '@/@types/tower.types';

import { TowerView } from '@/components/Tower/Tower';
import { makeEmptyStatement } from '@/mocks/tower';
import { useActionMenuStore } from '@/stores/actionMenu';
import { useWorkspaceScaleStore } from '@/stores/scale';
import { useWorkspaceStore } from '@/stores/workspace';
import { listNodes } from '@/utils/tower-traversal';
import { type ScaleLevel } from '@/utils/constants';

import { ActionMenu } from './ActionMenu';

/** Where the brick sits in the stage, far enough in that the ring has room on every side. */
const ORIGIN = { x: 160, y: 140 };

/** The same three wedges the workspace ships, each with something to do, to show the live ring. */
const enabledWedges: ActionMenuWedge[] = [
  {
    id: 'duplicate',
    label: 'Duplicate',
    tooltip: 'Copy this brick and everything under it',
    Icon: Copy,
    isEnabled: () => true,
    run: () => {},
  },
  {
    id: 'extract',
    label: 'Extract',
    tooltip: 'Take this brick out on its own, closing the gap it leaves',
    Icon: Scissors,
    isEnabled: () => true,
    run: () => {},
  },
  {
    id: 'trash',
    label: 'Move to trash',
    tooltip: 'Remove this brick and everything under it',
    Icon: Trash2,
    isEnabled: () => true,
    run: () => {},
  },
];

/** The trash wedge alone left with nothing to do, which is how an unavailable action is drawn. */
const mixedWedges: ActionMenuWedge[] = enabledWedges.map((wedge) =>
  wedge.id === 'trash' ? { ...wedge, isEnabled: () => false } : wedge,
);

interface StageProps {
  /** Left out to draw the three the workspace itself carries. */
  wedges?: ActionMenuWedge[];
  level: ScaleLevel;
}

/**
 * A single brick on a canvas with the menu already open on it.
 *
 * Stands in for the `Workspace`, which would need a palette, a trash and a pan hook to put one
 * brick on screen. The stores are what the menu actually reads, so seeding those is enough.
 */
function Stage({ wedges, level }: StageProps) {
  const [root] = useState<TowerStatementNode>(() => makeEmptyStatement('story-brick', 0, false));

  useEffect(() => {
    for (const node of listNodes(root)) {
      node.model.scaleLevel = level;
    }

    useWorkspaceScaleStore.setState({ level });
    useWorkspaceStore.setState({ towers: {}, selectedBrickId: null });
    useWorkspaceStore.getState().createTower({ id: 'story', root, position: ORIGIN });
    useActionMenuStore.getState().open(root.model.id);

    return () => {
      useActionMenuStore.getState().close();
      useWorkspaceStore.setState({ towers: {}, selectedBrickId: null });
    };
  }, [root, level]);

  return (
    <div className="bg-background relative h-full w-full">
      <TowerView root={root} origin={ORIGIN} asChild />
      <ActionMenu wedges={wedges} />
    </div>
  );
}

const meta: Meta<typeof Stage> = {
  title: 'Workspace/ActionMenu',
  component: Stage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    level: 2,
  },
  // The menu opens on its first wedge, so the arrow keys walk the ring as soon as the story loads.
  decorators: [
    (Story) => (
      <div className="h-screen w-screen p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Stage>;

/** The ring the workspace draws today: three wedges whose actions land in #796, #797 and #798. */
export const Default: Story = {};

export const AllEnabled: Story = {
  args: { wedges: enabledWedges },
};
AllEnabled.storyName = 'Wedges - all enabled';

/** A wedge with nothing to do is drawn dimmed and left in place, rather than dropped. */
export const OneDisabled: Story = {
  args: { wedges: mixedWedges },
};
OneDisabled.storyName = 'Wedges - one disabled';

export const SmallScale: Story = {
  args: { wedges: enabledWedges, level: 1 },
};
SmallScale.storyName = 'Scale level 1';

export const LargeScale: Story = {
  args: { wedges: enabledWedges, level: 3 },
};
LargeScale.storyName = 'Scale level 3';
