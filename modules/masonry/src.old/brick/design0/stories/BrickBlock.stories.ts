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
        View: CBrickBlock,
        Model: MBrickBlock,
        showIndicators: true,

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
        View: CBrickBlock,
        Model: MBrickBlock,
        showIndicators: true,

        label: 'Block',
        args: ['Label 1', 'Label 2'],
        colorBg: 'yellow',
        colorFg: 'black',
        outline: 'red',
        scale: 1,
    },
};
