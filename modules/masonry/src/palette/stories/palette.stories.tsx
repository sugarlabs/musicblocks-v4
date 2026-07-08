// src/palette/palette.stories.tsx

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import PaletteWrapper from '../components/paletteWrapper';

const meta: Meta<typeof PaletteWrapper> = {
  title: 'Old/Palette/Playground',
  component: PaletteWrapper,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export default meta;

type Story = StoryObj<typeof PaletteWrapper>;

export const Default: Story = {
  name: 'Palette',
};
