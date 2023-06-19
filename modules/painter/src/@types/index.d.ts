/**
 * Represents a generic sketch object — sketch modules need to implement these exclusively.
 */
export type ISketch = {
    /**
     * Sets up the canvas inside the DOM container
     * @param container DOM container element
     */
    setup(container: HTMLElement): void;
    /**
     * Draws a straight line.
     * @param x1 - x co-ordinate of point 1
     * @param y1 - y co-ordinate of point 1
     * @param x2 - x co-ordinate of point 2
     * @param y2 - y co-ordinate of point 2
     */
    drawLine(x1: number, y1: number, x2: number, y2: number): void;
    /**
     * Draws a point.
     * @param x - x co-ordinate of the point
     * @param y - y co-ordinate of the point
     */
    drawPoint(x: number, y: number): void;
    /**
     * Draws an arc.
     * @param x - x co-ordinate of arc's ellipse
     * @param y - y co-ordinate of arc's ellipse
     * @param w - width of arc's ellipse
     * @param h - height of arc's ellipse
     * @param start - angle to start the arc - in Radians
     * @param stop - angle to stop the arc - in Radians
     */
    drawArc(x: number, y: number, w: number, h: number, start: number, stop: number): void;
    /**
     * Draws a bezier curve.
     * @param x1 - x co-ordinate of anchor point 1
     * @param y1 - y co-ordinate of anchor point 1
     * @param x2 - x co-ordinate of control point 1
     * @param y2 - y co-ordinate of control point 1
     * @param x3 - x co-ordinate of control point 2
     * @param y3 - y co-ordinate of control point 2
     * @param x4 - x co-ordinate of anchor point 2
     * @param y4 - y co-ordinate of anchor point 2
     */
    drawBezier(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        x3: number,
        y3: number,
        x4: number,
        y4: number,
    ): void;
    /**
     * Sets fill color.
     * @param value - greyscale value
     */
    setFillOn(value: number): void;
    /**
     * Sets fill color.
     * @param v1 - red channel value
     * @param v2 - green channel value
     * @param v3 - blue channel value
     */
    setFillOn(v1: number, v2?: number, v3?: number): void;
    setFillOn(v1: number, v2?: number, v3?: number): void;
    /**
     * Clears the fill color.
     */
    setFillOff(): void;
    /**
     * Sets drawing color.
     * @param value - greyscale value
     */
    setColor(value: number): void;
    /**
     * Sets drawing color.
     * @param v1 - red channel value
     * @param v2 - green channel value
     * @param v3 - blue channel value
     */
    setColor(v1: number, v2?: number, v3?: number): void;
    setColor(v1: number, v2?: number, v3?: number): void;
    /**
     * Sets drawing thickness.
     * @param value - thickness
     */
    setThickness(value: number): void;
    /**
     * Sets background color.
     * @param value - greyscale value
     */
    setBackground(value: number): void;
    /**
     * Sets background color.
     * @param v1 - red channel value
     * @param v2 - green channel value
     * @param v3 - blue channel value
     */
    setBackground(v1: number, v2?: number, v3?: number): void;
    setBackground(v1: number, v2?: number, v3?: number): void;
    /**
     * Clears the canvas.
     */
    clear(): void;
};
