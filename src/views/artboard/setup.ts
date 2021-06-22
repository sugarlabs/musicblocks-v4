import type p5 from 'p5';

/** This is a setup function.*/
export const setup = (p: p5): void => {
    p.loadImage('activity-icon-color.svg');
    p.createCanvas(600, 600);
};

export const setBackground = (p: p5): void => {
    p.background(35);
};
