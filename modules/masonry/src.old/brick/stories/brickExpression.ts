import type { Meta, StoryObj } from '@storybook/react';

import CBrickExpression from './components/BrickExpression';

// -------------------------------------------------------------------------------------------------

export const MetaData: Meta<typeof CBrickExpression> = {
    component: CBrickExpression,
    parameters: {
        layout: 'centered',
    },
};

export type Story = StoryObj<typeof CBrickExpression>;
