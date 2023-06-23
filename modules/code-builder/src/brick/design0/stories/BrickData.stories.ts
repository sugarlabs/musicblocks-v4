import { MetaData, Story } from '../../stories/brickData';
import BrickData from '../BrickData';

export default {
    title: 'Design 0/Data Brick',
    ...MetaData,
};

// -------------------------------------------------------------------------------------------------

export const Static: Story = {
    args: {
        prototype: BrickData,
        label: 'Data',
        colorBg: 'yellow',
        colorFg: 'black',
        outline: 'red',
        scale: 1,
    },
};
