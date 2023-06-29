import { MetaData, Story } from '../../stories/brickBlock';
import MBrickBlock from '../BrickBlock';
import CBrickBlock from '../components/BrickBlock';

export default {
    title: 'Design 0/Block Brick',
    ...MetaData,
};

// -------------------------------------------------------------------------------------------------

export const NoArgs: Story = {
    args: {
        Component: CBrickBlock,
        prototype: MBrickBlock,
        label: 'Block',
        args: [],
        colorBg: 'yellow',
        colorFg: 'black',
        outline: 'red',
        scale: 1,
    },
};

export const WithArgs: Story = {
    args: {
        Component: CBrickBlock,
        prototype: MBrickBlock,
        label: 'Block',
        args: ['Label 1'],
        colorBg: 'yellow',
        colorFg: 'black',
        outline: 'red',
        scale: 1,
    },
};
