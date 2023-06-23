import { MetaData, Story } from '../../stories/brickStatement';
import BrickStatement from '../BrickStatement';

export default {
    title: 'Design 0/Statement Brick',
    ...MetaData,
};

// -------------------------------------------------------------------------------------------------

export const NoArgs: Story = {
    args: {
        prototype: BrickStatement,
        label: 'Statement',
        args: ['Label 1'],
        colorBg: 'yellow',
        colorFg: 'black',
        outline: 'red',
        scale: 1,
    },
};

export const WithArgs: Story = {
    args: {
        prototype: BrickStatement,
        label: 'Statement',
        args: ['Label 1'],
        colorBg: 'yellow',
        colorFg: 'black',
        outline: 'red',
        scale: 1,
    },
};
