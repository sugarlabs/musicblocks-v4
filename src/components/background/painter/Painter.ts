// -- types ----------------------------------------------------------------------------------------

import { IPainter, IPainterCallbacks } from '@/@types/painter';
import { TArtboardDimensions, TArtboardSpritePosition } from '@/@types/artboard';

// -- config ---------------------------------------------------------------------------------------

import { ARTBOARD_LINE_WIDTH } from '@/config';

// -- utils ----------------------------------------------------------------------------------------

import { degreesToRadians } from '@/utils/math';

// -- other components -----------------------------------------------------------------------------

import SketchP5 from './SketchP5';

// -- component definition -------------------------------------------------------------------------

/**
 * @class
 * Class representing the Painter component.
 */
export default class implements IPainter {
    private _sketch: SketchP5;
    private _callbacks: IPainterCallbacks;

    private _spriteHeading: number;

    public spritePosition: TArtboardSpritePosition;
    public spriteHeading: number;

    constructor(
        rootElement: HTMLElement,
        dimensions: TArtboardDimensions,
        callbacks: IPainterCallbacks,
    ) {
        this._sketch = new SketchP5(rootElement, dimensions);
        this._callbacks = callbacks;

        this.spritePosition = { x: 0, y: 0 };
        this.spriteHeading = 90;

        this._spriteHeading = 90;

        setTimeout(() => {
            this._sketch.setLineWidth(ARTBOARD_LINE_WIDTH);
        });
    }

    public updateSpritePosition(position: TArtboardSpritePosition): void {
        this.spritePosition = position;
        this._callbacks['updatePosition'](position);
    }

    public updateSpriteHeading(heading: number): void {
        heading = ((heading % 360) + 360) % 360;
        this.spriteHeading = heading;
        this._callbacks['updateHeading'](heading);
    }

    // -- helper methods ---------------------------------------------------------------------------

    /**
     * Helper for drawing shapes with (at once) or without (piece by piece) time parameter.
     *
     * @param fnOnce - function to be called if drawing is not timed
     * @param fnPieced - function to be called to draw a piece (if timed)
     * @param pieces - number of pieces
     * @param time - time to draw (in milliseconds)
     */
    private _drawTimed(
        fnOnce: () => void,
        fnPieced: (i: number) => void,
        pieces: number,
        time?: number,
    ) {
        if (!time) {
            fnOnce();
        } else {
            for (let i = 0; i < pieces; i++) {
                // slightly reducing the time quanta makes drawings accurate, hence 1 is added
                setTimeout(() => fnPieced(i), i * (time / (pieces + 1)));
            }
        }
    }

    /**
     * Helper for drawing a line.
     *
     * @param x1 - x-coordinate of first point
     * @param y1 - y-coordinate of first point
     * @param x2 - x-coordinate of second point
     * @param y2 - y-coordinate of second point
     * @param time - time to draw (in milliseconds)
     */
    private _drawLine(x1: number, y1: number, x2: number, y2: number, time?: number) {
        const drawOnce = (): void => {
            this._sketch.drawLine(x1, y1, x2, y2);
            this.updateSpritePosition({
                x: x2,
                y: y2,
            });
        };

        const ATOM = 1;
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const pieces = length / ATOM;

        const theta = Math.atan2(y2 - y1, x2 - x1);
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);

        const drawPiece = (i: number): void => {
            const [x2, y2] = [x1 + (i + 1) * ATOM * cos, y1 + (i + 1) * ATOM * sin];
            this._sketch.drawLine(x1 + i * ATOM * cos, y1 + i * ATOM * sin, x2, y2);
            this.updateSpritePosition({
                x: x2,
                y: y2,
            });
        };

        this._drawTimed(drawOnce, drawPiece, pieces, time);
    }

    /**
     * Helper for drawing an arc.
     *
     * @param radius - radius of the arc
     * @param angle - angle subtended at the center of the arc
     * @param direction - `clockwise` or `anti-clockwise`
     * @param time - time to draw (in milliseconds)
     */
    private _drawArc(
        radius: number,
        angle: number,
        direction?: 'clockwise' | 'anti-clockwise',
        time?: number,
    ) {
        const theta = Math.atan(-1 / Math.tan(degreesToRadians(this.spriteHeading)));
        const [x, y] = [
            this.spritePosition.x +
                (direction === 'anti-clockwise' ? -1 : 1) * radius * Math.cos(theta),
            this.spritePosition.y +
                (direction === 'anti-clockwise' ? -1 : 1) * radius * Math.sin(theta),
        ];

        let [startAngle, stopAngle] = [
            (direction === 'anti-clockwise' ? -1 : 1) * 90 + this.spriteHeading,
            (direction === 'anti-clockwise' ? -1 : 1) * 90 +
                this.spriteHeading +
                (direction === 'anti-clockwise' ? 1 : -1) * angle,
        ];

        const drawOnce = (): void => {
            this._sketch.drawArc(x, y, radius << 1, radius << 1, startAngle, stopAngle);
        };

        const ATOM = 1;
        const sign = Math.sign(stopAngle - startAngle);

        const drawPiece = (i: number): void => {
            this._sketch.drawArc(
                x,
                y,
                radius << 1,
                radius << 1,
                startAngle + sign * i * ATOM,
                startAngle + sign * (i + 1) * ATOM,
            );
        };

        this._drawTimed(drawOnce, drawPiece, Math.abs(startAngle - stopAngle) / ATOM, time);
    }

    // -- drawing methods --------------------------------------------------------------------------

    public moveForward(steps: number, time?: number): void {
        const [x1, y1] = [this.spritePosition.x, this.spritePosition.y];
        const [x2, y2] = [
            x1 + steps * Math.cos(degreesToRadians(this.spriteHeading)),
            y1 + steps * Math.sin(degreesToRadians(this.spriteHeading)),
        ];
        this._drawLine(x1, y1, x2, y2, time);
    }

    public moveArc(
        radius: number,
        angle: number,
        direction: 'clockwise' | 'anti-clockwise',
        time?: number,
    ): void {
        this._drawArc(radius, angle, direction, time);
    }

    public rotate(angle: number, direction?: 'clockwise' | 'anti-clockwise'): void {
        this.updateSpriteHeading(
            this.spriteHeading + (direction === 'anti-clockwise' ? 1 : -1) * angle,
        );
    }

    public setColor(r: number, g: number, b: number): void {
        this._sketch.setColor(r, g, b);
    }

    public setBackground(r: number, g: number, b: number): void {
        this._sketch.setBackground(r, g, b);
    }
}
