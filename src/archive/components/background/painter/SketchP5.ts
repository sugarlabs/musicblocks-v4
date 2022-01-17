import p5 from 'p5';

// -- types ----------------------------------------------------------------------------------------

import { ISketch } from '../../../@types/painter';
import { TArtboardDimensions } from '../../../@types/artboard';

// -- component definition -------------------------------------------------------------------------

/**
 * @class
 * Class encapsulating the graphics rendering functionality of the Painter component using `p5.js`.
 */
export default class implements ISketch {
    private p: p5;

    constructor(rootElement: HTMLElement, dimensions: TArtboardDimensions) {
        this.p = new p5(() => null, rootElement);

        this.p.setup = () => {
            this.p.createCanvas(dimensions.width, dimensions.height);
            // move the origin to center
            this.p.translate(this.p.width / 2, this.p.height / 2);
            // flip y-axis
            this.p.scale(1, -1);
            // set angle mode to use degrees instead of radians
            this.p.angleMode(this.p.DEGREES);
            // don't auto-fill shapes
            this.p.noFill();
            // don't loop draw function
            this.p.noLoop();
        };
    }

    public drawPoint(x: number, y: number): void {
        this.p.point(x, y);
    }

    public drawLine(x1: number, y1: number, x2: number, y2: number): void {
        this.p.line(x1, y1, x2, y2);
    }

    public drawArc(
        x: number,
        y: number,
        width: number,
        height: number,
        startAngle: number,
        stopAngle: number,
    ): void {
        if (startAngle > stopAngle) {
            [startAngle, stopAngle] = [stopAngle, startAngle];
        }
        this.p.arc(x, y, width, height, startAngle, stopAngle, this.p.OPEN);
    }

    public setColor(r: number, g: number, b: number): void {
        this.p.stroke(r, g, b);
    }

    public setLineWidth(value: number): void {
        this.p.strokeWeight(value);
    }

    public setBackground(r: number, g: number, b: number): void {
        this.p.background(r, g, b);
    }
}
