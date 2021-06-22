import type p5 from 'p5';

/** This is a draw function. */
export const draw = (p: p5): void => {
    p.background(220);
    p.ellipse(p.mouseX, p.mouseY, 80, 80);
    p.rect(50, 50, 50, 50);
};
