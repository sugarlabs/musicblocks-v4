import { MetaData, Story } from '../../stories/brickStatement';
import MBrickStatement from '../BrickStatement';
import CBrickStatement from '../components/BrickStatement';

export default {
    title: 'Design 0/Statement Brick',
    ...MetaData,
};

// -------------------------------------------------------------------------------------------------

export const NoArgs: Story = {
    args: {
        Component: CBrickStatement,
        prototype: MBrickStatement,
        label: 'Statement',
        args: [],
        colorBg: 'yellow',
        colorFg: 'black',
        outline: 'red',
        scale: 1,
    },
};

export const WithArgs: Story = {
    args: {
        Component: CBrickStatement,
        prototype: MBrickStatement,
        label: 'Statement',
        args: ['Label 1'],
        colorBg: 'yellow',
        colorFg: 'black',
        outline: 'red',
        scale: 1,
    },
};
