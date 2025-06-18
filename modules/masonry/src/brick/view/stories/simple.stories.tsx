// src/brick/view/components/simple.stories.tsx

import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import SimpleBrickView from '../components/simple';
import type { TColor, TExtent, TVisualState } from '../../@types/brick';

const VISUAL_STATES = [
  'default',
  'hovered',
  'selected',
  'executing',
  'unconnected',
  'dragged',
] as TVisualState[];

const centerDecorator = (Story: any) => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
    <Story />
  </div>
);

export default {
  title: 'Bricks/SimpleBrick',
  component: SimpleBrickView,
  decorators: [centerDecorator],

  argTypes: {
    // hide plumbing
    uuid: { table: { disable: true } },
    name: { table: { disable: true } },
    x: { table: { disable: true } },
    y: { table: { disable: true } },
    onClick: { table: { disable: true } },

    // now _enable_ bboxArgs as editable JSON
    bboxArgs: {
      name: 'Arg Bounding Boxes',
      description: 'Array of argument-slot extents, e.g. [{ w: 20, h: 10 }, { w: 15, h: 8 }]',
      control: 'object',
    },

    // shared props
    label: { control: 'text' },
    labelType: {
      control: 'select',
      options: ['text', 'glyph', 'icon', 'thumbnail'],
    },
    colorBg: { control: 'color' },
    colorFg: { control: 'color' },
    strokeColor: { control: 'color' },
    shadow: { control: 'boolean' },
    scale: { control: { type: 'number', min: 0.1, max: 3, step: 0.1 } },
    tooltip: { control: 'text' },

    // visual state
    visualState: {
      name: 'Visual State',
      control: { type: 'select', options: VISUAL_STATES },
    },

    // boolean flags
    isActionMenuOpen: {
      name: 'Action Menu Open',
      control: 'boolean',
    },
    isVisible: {
      name: 'Visible',
      control: 'boolean',
    },
    topNotch: {
      name: 'Top Notch',
      control: 'boolean',
    },
    bottomNotch: {
      name: 'Bottom Notch',
      control: 'boolean',
    },
  },
} as Meta<typeof SimpleBrickView>;

type Props = React.ComponentProps<typeof SimpleBrickView>;

const baseArgs: Props = {
  uuid: 'simple-1',
  name: 'simple-1',
  label: 'Simple Brick',
  labelType: 'text',
  colorBg: '#FFEB3B' as TColor,
  colorFg: '#000' as TColor,
  strokeColor: '#333' as TColor,
  shadow: false,
  scale: 1,
  tooltip: 'This is a simple brick',
  // you can now tweak these in the Playground
  topNotch: false,
  bottomNotch: false,
  bboxArgs: [] as TExtent[],
  x: 0,
  y: 0,
  visualState: 'default',
  isActionMenuOpen: false,
  isVisible: true,
};

const Template: StoryFn<Props> = (args) => <SimpleBrickView {...args} />;

// ── Playground ────────────────────────────────────────────
export const Playground = Template.bind({});
Playground.storyName = 'Playground';
Playground.args = { ...baseArgs };
// No `parameters.controls.include` here, so all enabled controls show up — including bboxArgs

// ── Visual States ─────────────────────────────────────────
export const VisualStates = Template.bind({});
VisualStates.storyName = 'Visual States';
VisualStates.args = { ...baseArgs };
VisualStates.parameters = {
  controls: { include: ['visualState'] },
};

// ── Notch Variants ────────────────────────────────────────
export const NotchVariants = Template.bind({});
NotchVariants.storyName = 'Notch Variants';
NotchVariants.args = { ...baseArgs };
NotchVariants.parameters = {
  controls: { include: ['topNotch', 'bottomNotch'] },
};

// ── Action Menu ───────────────────────────────────────────
export const ActionMenu = Template.bind({});
ActionMenu.storyName = 'Action Menu';
ActionMenu.args = { ...baseArgs };
ActionMenu.parameters = {
  controls: { include: ['isActionMenuOpen'] },
};

// ── Visibility ────────────────────────────────────────────
export const Visibility = Template.bind({});
Visibility.storyName = 'Visibility';
Visibility.args = { ...baseArgs };
Visibility.parameters = {
  controls: { include: ['isVisible'] },
};
