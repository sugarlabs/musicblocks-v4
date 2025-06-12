import type { Meta, StoryObj } from '@storybook/react';

import CBrickData from './components/BrickData';

// -------------------------------------------------------------------------------------------------

export const MetaData: Meta<typeof CBrickData> = {
    component: CBrickData,
    parameters: {
        layout: 'centered',
    },
};

export type Story = StoryObj<typeof CBrickData>;
