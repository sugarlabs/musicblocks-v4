import type { Meta, StoryObj } from '@storybook/react-vite';

import CBrickStatement from './components/BrickStatement';

// -------------------------------------------------------------------------------------------------

export const MetaData: Meta<typeof CBrickStatement> = {
    component: CBrickStatement,
    parameters: {
        layout: 'centered',
    },
};

export type Story = StoryObj<typeof CBrickStatement>;
