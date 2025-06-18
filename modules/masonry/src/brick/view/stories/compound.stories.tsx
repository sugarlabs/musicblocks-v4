import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import CompoundBrickView, { CompoundBrickViewProps } from '../components/compound';
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
  title: 'Bricks/CompoundBrick',
  component: CompoundBrickView,
  decorators: [centerDecorator],

  argTypes: {
    // plumbing
    uuid: { table: { disable: true } },
    name: { table: { disable: true } },
    x: { table: { disable: true } },
    y: { table: { disable: true } },
    onClick: { table: { disable: true } },

    // shared props
    label: { control: 'text' },
    labelType: { control: 'select', options: ['text', 'glyph', 'icon', 'thumbnail'] },
    colorBg: { control: 'color' },
    colorFg: { control: 'color' },
    strokeColor: { control: 'color' },
    shadow: { control: 'boolean' },
    isHighlighted: { name: 'Highlighted', control: 'boolean' },
    scale: { control: { type: 'number', min: 0.1, max: 3, step: 0.1 } },
    tooltip: { control: 'text' },

    // connectors
    topNotch: { name: 'Top Notch', control: 'boolean' },
    bottomNotch: { name: 'Bottom Notch', control: 'boolean' },

    // argument-slot boxes
    bboxArgs: {
      name: 'Arg Bounding Boxes',
      description: 'Array of { w, h } for each argument slot',
      control: 'object',
    },

    // nesting-area boxes
    bboxNest: {
      name: 'Nest Bounding Boxes',
      description: 'Array of { w, h } for nested content area',
      control: 'object',
    },

    // visual flags
    visualState: {
      name: 'Visual State',
      control: { type: 'select', options: VISUAL_STATES },
    },
    isActionMenuOpen: {
      name: 'Action Menu Open',
      control: 'boolean',
    },
    isFolded: {
      name: 'Folded',
      control: 'boolean',
    },
    isVisible: {
      name: 'Visible',
      control: 'boolean',
    },
  },
} as Meta<CompoundBrickViewProps>;

const baseArgs: CompoundBrickViewProps = {
  uuid: 'compound-1',
  name: 'compound-1',
  label: 'Compound Brick',
  labelType: 'text',
  colorBg: '#FFEB3B' as TColor,
  colorFg: '#000' as TColor,
  strokeColor: '#333' as TColor,
  shadow: false,
  isHighlighted: false,
  tooltip: 'This is a compound brick',
  scale: 1,

  topNotch: false,
  bottomNotch: false,
  bboxArgs: [] as TExtent[],
  bboxNest: [] as TExtent[],

  visualState: 'default',
  isActionMenuOpen: false,
  isFolded: false,
  isVisible: true,

  x: 0,
  y: 0,
};

const Template: StoryFn<CompoundBrickViewProps> = (args) => <CompoundBrickView {...args} />;

// ── Playground ────────────────────────────────────────────
export const Playground = Template.bind({});
Playground.storyName = 'Playground';
Playground.args = { ...baseArgs };

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

// ── Arg Bounding Boxes ────────────────────────────────────
export const ArgBoundingBoxes = Template.bind({});
ArgBoundingBoxes.storyName = 'Arg Bounding Boxes';
ArgBoundingBoxes.args = {
  ...baseArgs,
  bboxArgs: [
    { w: 30, h: 40 },
    { w: 60, h: 80 },
  ],
};
ArgBoundingBoxes.parameters = {
  controls: { include: ['bboxArgs'] },
};

// ── Nest Bounding Boxes ───────────────────────────────────
export const NestBoundingBoxes = Template.bind({});
NestBoundingBoxes.storyName = 'Nest Bounding Boxes';
NestBoundingBoxes.args = {
  ...baseArgs,
  bboxNest: [
    { w: 120, h: 60 },
    { w: 100, h: 40 },
  ],
};
NestBoundingBoxes.parameters = {
  controls: { include: ['bboxNest'] },
};

// ── Folded ────────────────────────────────────────────────
export const Folded = Template.bind({});
Folded.storyName = 'Folded';
Folded.args = {
  ...baseArgs,
  isFolded: true,
  // give it some nesting space to see the fold effect:
  bboxNest: [{ w: 100, h: 50 }],
};
Folded.parameters = {
  controls: { include: ['isFolded'] },
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
