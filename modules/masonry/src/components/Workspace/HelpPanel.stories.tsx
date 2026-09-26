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
export const StatementBrick: Story = {
  render: () => <Opened help={REPEAT} />,
};
StatementBrick.storyName = 'Statement brick';

export const ExpressionBrick: Story = {
  render: () => <Opened help={ADD} />,
};
ExpressionBrick.storyName = 'Expression brick';
