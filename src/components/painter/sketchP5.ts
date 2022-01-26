import p5 from 'p5';

// -------------------------------------------------------------------------------------------------

/** p5 sketch instance. */
let sketch: p5;

/**
 * Initializes a p5 instance and sets it up inside provided DOM element.
 * @param container - DOM element which will contain the p5 canvas.
 */
export function setup(container: HTMLElement): void {
    const { width, height } = container.getBoundingClientRect();

    new p5((p) => {
        sketch = p;

        p.setup = () => {
            p.createCanvas(width, height);
            p.noLoop();
        };
    }, container);
}

/**
 * Draws a straight line.
 * @param x1 - x co-ordinate of point 1
 * @param y1 - y co-ordinate of point 1
 * @param x2 - x co-ordinate of point 2
 * @param y2 - y co-ordinate of point 2
 */
export function drawLine(x1: number, y1: number, x2: number, y2: number): void {
    sketch.line(x1, y1, x2, y2);
}

/**
 * Sets drawing color.
 * @param value - greyscale value
 */
export function setColor(value: number): void;
/**
 * Sets drawing color.
 * @param v1 - red channel value
 * @param v2 - green channel value
 * @param v3 - blue channel value
 */
export function setColor(v1: number, v2?: number, v3?: number): void;
export function setColor(v1: number, v2?: number, v3?: number): void {
    if (typeof v2 === 'number' && typeof v3 === 'number') {
        sketch.stroke(v1, v2, v3);
    } else {
        sketch.stroke(v1);
    }
}

/**
 * Sets drawing thickness.
 * @param value - thickness
 */
export function setThickness(value: number): void {
    sketch.strokeWeight(value);
}

/**
 * Sets background color.
 * @param value - greyscale value
 */
export function setBackground(value: number): void;
/**
 * Sets background color.
 * @param v1 - red channel value
 * @param v2 - green channel value
 * @param v3 - blue channel value
 */
export function setBackground(v1: number, v2?: number, v3?: number): void;
export function setBackground(v1: number, v2?: number, v3?: number): void {
    if (typeof v2 === 'number' && typeof v3 === 'number') {
        sketch.background(v1, v2, v3);
    } else {
        sketch.background(v1);
    }
}
