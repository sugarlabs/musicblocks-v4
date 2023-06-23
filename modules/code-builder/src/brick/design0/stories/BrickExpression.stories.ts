import { MetaData, Story } from '../../stories/brickExpression';
import BrickExpression from '../BrickExpression';

export default {
    title: 'Design 0/Expression Brick',
    ...MetaData,
};

// -------------------------------------------------------------------------------------------------

export const NoArgs: Story = {
    args: {
        prototype: BrickExpression,
        label: 'Expression',
        args: ['Label 1'],
        colorBg: 'yellow',
        colorFg: 'black',
        outline: 'red',
        scale: 1,
    },
};

export const WithArgs: Story = {
    args: {
        prototype: BrickExpression,
        label: 'Expression',
        args: ['Label 1'],
        colorBg: 'yellow',
        colorFg: 'black',
        outline: 'red',
        scale: 1,
    },
};
