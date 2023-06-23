import { MetaData, Story } from '../../stories/brickBlock';
import BrickBlock from '../BrickBlock';

export default {
    title: 'Design 0/Block Brick',
    ...MetaData,
};

// -------------------------------------------------------------------------------------------------

export const NoArgs: Story = {
    args: {
        prototype: BrickBlock,
        label: 'Block',
        args: ['Label 1'],
        colorBg: 'yellow',
        colorFg: 'black',
        outline: 'red',
        scale: 1,
    },
};

export const WithArgs: Story = {
    args: {
        prototype: BrickBlock,
        label: 'Block',
        args: ['Label 1'],
        colorBg: 'yellow',
        colorFg: 'black',
        outline: 'red',
        scale: 1,
    },
};
