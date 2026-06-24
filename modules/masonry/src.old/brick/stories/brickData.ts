import type { Meta, StoryObj } from '@storybook/react-vite';

import CBrickData from './components/BrickData';

// -------------------------------------------------------------------------------------------------

export const MetaData: Meta<typeof CBrickData> = {
    component: CBrickData,
    parameters: {
        layout: 'centered',
    },
};

export type Story = StoryObj<typeof CBrickData>;
