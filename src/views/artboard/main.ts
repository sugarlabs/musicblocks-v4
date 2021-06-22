import p5 from 'p5';
import { createSketch } from '../../utils/ambience';
import { setup, setBackground } from './setup';
import { draw } from './draw';

const sketch = createSketch({
    setup,
    draw,
    setBackground,
});

export const p: p5 = new p5(sketch);
