import { MetaData, Story } from '../../stories/brickData';
import MBrickData from '../BrickData';
import CBrickData from '../components/BrickData';

export default {
    title: 'Design 0/Data Brick',
    ...MetaData,
};

// -------------------------------------------------------------------------------------------------

export const Static: Story = {
    args: {
        Component: CBrickData,
        prototype: MBrickData,
        label: 'Data',
        colorBg: 'yellow',
        colorFg: 'black',
        outline: 'red',
        scale: 1,
    },
};
