import type p5 from 'p5';
import { createSketch } from '../../utils/ambience';
import { getViewportDimensions } from '../../utils/ambience';

/** This is a setup function.*/
const setup = (p: p5): void => {
    const [width, height]: [number, number] = getViewportDimensions();
    p.createCanvas(width, height);
    p.loadImage('activity-icon.svg', (img) => {
        p.image(img, 0, 0);
    });
};

/** This is a draw function. */
const draw = (p: p5): void => {
    p.background(50);
    p.ellipse(p.mouseX, p.mouseY, 80, 80);

    if (p.mouseIsPressed) {
        p.background(23, 34, 56);
    } else {
        p.rect(25, 25, 50, 50);
    }
};

export const sketch = createSketch({
    setup,
    draw,
});
