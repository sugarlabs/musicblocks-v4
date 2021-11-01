import { TArtboardSpritePosition } from './artboard';

// -- Sketch ---------------------------------------------------------------------------------------

/**
 * Interface for the class implementing a Sketch component. Classes that implement this are
 * supposed to wrap a canvas graphics library which actually does the drawing.
 */
export interface ISketch {
    /**
     * Draws a point.
     * @param x - x-coordinate of the point
     * @param y - y-coordinate of the point
     */
    drawPoint(x: number, y: number): void;
    /**
     * Draws a line-segment between two points.
     * @param x1 - x-coordinate of first point
     * @param y1 - y-coordinate of first point
     * @param x2 - x-coordinate of second point
     * @param y2 - y-coordinate of second point
     */
    drawLine(x1: number, y1: number, x2: number, y2: number): void;
    /**
     * Draws an arc.
     * @param x - x-coordinate of the center of the arc
     * @param y - y-coordinate of the center of the arc
     * @param width - width of the arc's ellipse
     * @param height - height of the arc's ellipse
     * @param startAngle - start angle of the arc subtended at the center
     * @param stopAngle - stop angle of the arc subtended at the center
     */
    drawArc(
        x: number,
        y: number,
        width: number,
        height: number,
        startAngle: number,
        stopAngle: number,
    ): void;
    /**
     * Sets the color of the outlines drawn specified in RGB.
     * @param r - red value (`0` - `255`)
     * @param g - green value (`0` - `255`)
     * @param b - blue value (`0` - `255`)
     */
    setColor(r: number, g: number, b: number): void;
    /**
     * Sets the thickness (stroke width) of the lines drawn.
     * @param value - thickness (in pixels)
     */
    setLineWidth(value: number): void;
    /**
     * Sets the background to color specified in RGB.
     * @param r - red value (`0` - `255`)
     * @param g - green value (`0` - `255`)
     * @param b - blue value (`0` - `255`)
     */
    setBackground(r: number, g: number, b: number): void;
}

// -- Painter --------------------------------------------------------------------------------------

/** Interface for the callbacks supplied to the Painter component */
export interface IPainterCallbacks {
    /**
     * Handler for catching sprite position updates.
     * @param position - new position co-ordinates of the sprite
     */
    updatePosition(position: TArtboardSpritePosition): void;
    /**
     * Handler for catching sprite heading updates.
     * @param heading - new angle made by the sprite's head w.r.t. the co-ordinate x-axis
     */
    updateHeading(heading: number): void;
}

/**
 * Interface for the class implementing the Painter component.
 */
export interface IPainter {
    /** Position co-ordinates of the sprite. */
    spritePosition: TArtboardSpritePosition;
    /** Angle made by the sprite's head w.r.t. the co-ordinate x-axis (anti-clockwise positive). */
    spriteHeading: number;
    /**
     * Updates the sprite's position coordinates.
     * @param position - position co-ordinates of the sprite
     */
    updateSpritePosition(position: TArtboardSpritePosition): void;
    /**
     * Update the sprite's heading angle.
     * @param heading - angle made by the sprite's head w.r.t. the co-ordinate x-axis
     */
    updateSpriteHeading(heading: number): void;

    // -- drawing methods ------------------------------------------------------

    /**
     * Draws a line forward in the direction the sprite is headed.
     * @param steps - distance (in pixels)
     * @param time - time to draw (in milliseconds)
     */
    moveForward(steps: number, time?: number): void;
    /**
     * Draws an arc centered at the `radius` distance perpendicular to the sprite's heading,
     * starting from the sprite's current position.
     * @param radius - radius of the arc (distance of the center from the sprite)
     * @param angle - angle subtended at the center of the arc
     * @param direction - `clockwise` or `anti-clockwise`
     * @param time - time to draw (in milliseconds)
     */
    moveArc(
        radius: number,
        angle: number,
        direction: 'clockwise' | 'anti-clockwise',
        time?: number,
    ): void;
    /**
     * Rotates the sprite's heading.
     * @param angle - angle of rotation
     * @param direction - `clockwise` or `anti-clockwise`
     */
    rotate(angle: number, direction?: 'clockwise' | 'anti-clockwise'): void;
    /**
     * Sets the color of the outlines drawn specified in RGB.
     * @param r - red value (`0` - `255`)
     * @param g - green value (`0` - `255`)
     * @param b - blue value (`0` - `255`)
     */
    setColor(r: number, g: number, b: number): void;
    /**
     * Sets the background to color specified in RGB.
     * @param r - red value (`0` - `255`)
     * @param g - green value (`0` - `255`)
     * @param b - blue value (`0` - `255`)
     */
    setBackground(r: number, g: number, b: number): void;
}
