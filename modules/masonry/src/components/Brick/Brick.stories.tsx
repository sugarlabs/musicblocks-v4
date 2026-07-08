import type { Meta, StoryObj } from '@storybook/react-vite';

import mouseSvg from '@/assets/mouse.svg';

import { ExpressionBrickModel, StatementBrickModel, ValueBrickModel } from '@/models/brick';

import { BrickView } from './Brick';

// All stories construct a model instance and pass it to BrickView.
// Models cannot be serialised to Storybook args, so every story uses `render`.
const meta: Meta = {
  title: 'Brick/Brick',
  component: BrickView,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj;

// ─── Fixed / Display ─────────────────────────────────────────────────────────

export const ValueLabel: Story = {
  render: () => (
    <BrickView
      kind="value"
      model={
        new ValueBrickModel({
          colorsDefault: { background: '#3498db', foreground: '#ffffff', border: '#2980b9' },
          tooltipText: '',
          widget: { type: 'label', text: 'Variable' },
        })
      }
    />
  ),
};
ValueLabel.storyName = 'Value - Label';

export const ExpressionLabel: Story = {
  render: () => (
    <BrickView
      kind="expression"
      model={
        new ExpressionBrickModel({
          colorsDefault: { background: '#2ecc71', foreground: '#ffffff', border: '#27ae60' },
          tooltipText: '',
          widget: { type: 'label', text: 'Add' },
          params: ['A', 'B'],
          argDims: [
            { w: 40, h: 20 },
            { w: 40, h: 20 },
          ],
        })
      }
    />
  ),
};
ExpressionLabel.storyName = 'Expression - Label';

export const ExpressionVariant: Story = {
  render: () => (
    <BrickView
      kind="expression"
      model={
        new ExpressionBrickModel({
          colorsDefault: { background: '#ff7979', foreground: '#000000', border: '#eb4d4b' },
          tooltipText: '',
          widget: {
            type: 'variant',
            options: ['Option 1', 'Option 2', 'Option 3'],
            value: 'Option 1',
          },
          params: ['num 1', 'num 2'],
          argDims: [
            { w: 40, h: 20 },
            { w: 40, h: 20 },
          ],
        })
      }
    />
  ),
};
ExpressionVariant.storyName = 'Expression - Variant';

export const StatementSimple: Story = {
  render: () => (
    <BrickView
      kind="statement"
      model={
        new StatementBrickModel({
          colorsDefault: { background: '#9b59b6', foreground: '#ffffff', border: '#8e44ad' },
          tooltipText: '',
          widget: { type: 'label', text: 'Simple Statement' },
          params: ['delay'],
          argDims: [{ w: 40, h: 20 }],
          hasConnectionPrev: true,
          hasConnectionNext: true,
        })
      }
    />
  ),
};

export const StatementNested: Story = {
  render: () => (
    <BrickView
      kind="statement"
      model={
        new StatementBrickModel({
          colorsDefault: { background: '#f1c40f', foreground: '#333333', border: '#f39c12' },
          tooltipText: '',
          widget: { type: 'label', text: 'Repeat', glyph: { src: mouseSvg } },
          params: ['times'],
          argDims: [{ w: 30, h: 20 }],
          hasNesting: true,
          nestingDims: { w: 100, h: 60 },
          hasConnectionPrev: true,
          hasConnectionNext: true,
        })
      }
    />
  ),
};

// ─── Input ───────────────────────────────────────────────────────────────────

const inputColors = { background: '#f1c40f', foreground: '#333333', border: '#f39c12' };

export const ValueTextbox: Story = {
  render: () => (
    <BrickView
      kind="value"
      model={
        new ValueBrickModel({
          colorsDefault: inputColors,
          tooltipText: '',
          widget: { type: 'textbox', value: 'Hello', maxLength: 20 },
        })
      }
    />
  ),
};
ValueTextbox.storyName = 'Value - Textbox';

export const ValueNumberbox: Story = {
  render: () => (
    <BrickView
      kind="value"
      model={
        new ValueBrickModel({
          colorsDefault: inputColors,
          tooltipText: '',
          widget: { type: 'numberbox', value: 5, min: 0, max: 10, step: 1 },
        })
      }
    />
  ),
};
ValueNumberbox.storyName = 'Value - Numberbox';

export const ValueToggle: Story = {
  render: () => (
    <BrickView
      kind="value"
      model={
        new ValueBrickModel({
          colorsDefault: inputColors,
          tooltipText: '',
          widget: { type: 'toggle', value: true, labels: { on: 'Yes', off: 'No' } },
        })
      }
    />
  ),
};
ValueToggle.storyName = 'Value - Toggle';

export const ValueSlider: Story = {
  render: () => (
    <BrickView
      kind="value"
      model={
        new ValueBrickModel({
          colorsDefault: inputColors,
          tooltipText: '',
          widget: { type: 'slider', value: 50, min: 0, max: 100, step: 5 },
        })
      }
    />
  ),
};
ValueSlider.storyName = 'Value - Slider';

export const ValueSelect: Story = {
  render: () => (
    <BrickView
      kind="value"
      model={
        new ValueBrickModel({
          colorsDefault: inputColors,
          tooltipText: '',
          widget: {
            type: 'select',
            options: ['Option 1', 'Option 2', 'Option 3'],
            value: 'Option 1',
          },
        })
      }
    />
  ),
};
ValueSelect.storyName = 'Value - Select';
