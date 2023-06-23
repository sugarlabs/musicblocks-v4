import type { Meta, StoryObj } from '@storybook/react';

import CBrickBlock from './components/BrickBlock';

// -------------------------------------------------------------------------------------------------

export const MetaData: Meta<typeof CBrickBlock> = {
    component: CBrickBlock,
    parameters: {
        layout: 'centered',
    },
};

export type Story = StoryObj<typeof CBrickBlock>;
