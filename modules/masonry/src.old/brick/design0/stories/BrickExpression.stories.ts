import { MetaData, Story } from '../../stories/brickExpression';
import MBrickExpression from '../BrickExpression';
import CBrickExpression from '../components/BrickExpression';

export default {
    title: 'Design 0/Expression Brick',
    ...MetaData,
};

// -------------------------------------------------------------------------------------------------

export const WithArgs: Story = {
    args: {
        Component: CBrickExpression,
        prototype: MBrickExpression,
        label: 'Expression',
        args: ['Label 1'],
        colorBg: 'yellow',
        colorFg: 'black',
        outline: 'red',
        scale: 1,
    },
};
