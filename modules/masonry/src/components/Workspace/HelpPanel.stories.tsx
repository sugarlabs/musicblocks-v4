import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';

import { ExpressionBrickModel, StatementBrickModel } from '@/models/brick';
import { useBrickHelpStore } from '@/stores/brickHelp';
import type { BrickHelp } from '@/utils/brick-help';

import { HelpPanel } from './HelpPanel';

// The panel is opened through its store, the way the pie menu's help wedge opens it, so each story
// opens it on mount and closes it again on unmount.
const meta: Meta = {
  title: 'Workspace/HelpPanel',
  component: HelpPanel,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

/** Opens the panel on `help` for as long as the story is mounted. */
function Opened({ help }: { help: BrickHelp }) {
  useEffect(() => {
    useBrickHelpStore.getState().show(help);
    return () => useBrickHelpStore.getState().hide();
  }, [help]);

  return <HelpPanel />;
}

const REPEAT: BrickHelp = {
  brickId: 'repeat-1',
  title: 'repeat',
  text: 'Repeats the bricks inside it the given number of times, then carries on with whatever comes after it.',
  preview: new StatementBrickModel({
    colorsDefault: { background: '#e07a5f', foreground: '#ffffff', border: '#00000033' },
    tooltipText: '',
    widget: { type: 'label', text: 'repeat' },
    params: ['times'],
    hasNesting: true,
    hasConnectionPrev: true,
    hasConnectionNext: true,
  }),
};

const ADD: BrickHelp = {
  brickId: 'add-1',
  title: 'Add',
  text: 'Adds its two numbers together.',
  preview: new ExpressionBrickModel({
    colorsDefault: { background: '#2ecc71', foreground: '#ffffff', border: '#27ae60' },
    tooltipText: '',
    widget: { type: 'label', text: 'Add' },
    params: ['A', 'B'],
  }),
};

/** Drag it by the title bar; close it with the button or Escape. */
export const BesideABrick: Story = {
  render: () => (
    <>
      {/* Stands in for the brick on the canvas the help was opened on. */}
      <div
        className="fixed rounded border border-dashed"
        style={{ left: 120, top: 160, width: 140, height: 32 }}
      />
      <Opened help={{ ...REPEAT, anchor: { x: 120, y: 160, w: 140, h: 32 } }} />
    </>
  ),
};
BesideABrick.storyName = 'Beside a brick, pointing at it';

/** Opened without a brick to point at, it centres. */
export const StatementBrick: Story = {
  render: () => <Opened help={REPEAT} />,
};
StatementBrick.storyName = 'Statement brick';

export const ExpressionBrick: Story = {
  render: () => <Opened help={ADD} />,
};
ExpressionBrick.storyName = 'Expression brick';
