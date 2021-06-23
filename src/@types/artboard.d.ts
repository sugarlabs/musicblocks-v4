/**
 * Interface for the Artboard component's View props.
 */
export interface IArtboardProps {
    /** Viewport dimensions as [width, height]. */
    dimensions: [number, number];
    /** Refreshes the viewport dimensions state. */
    updateDimensions: () => void;
    /** width of the Artboard */
    width: number;
    /** height of the Artboard */
    height: number;
    /** scale factor in X */
    scaleX: number;
    /** scale factor in Y */
    scaleY: number;
    /** Function to hide aux menu */
    /** Function to clear the canvas */
    /** Function to hide all grids */
    /** Function that renders Cartesian/Polar  */
    /** Sets the scale of the turtle canvas. */
    setArtBoardScale: (scale: number) => void;
    /**  */
}

/** Function that may be called on any keyboard event. */
type KeyboardEventCallback = (event?: KeyboardEvent) => void | boolean;

/** Function that may be called on any mouse event. */
type MouseEventCallback = (event?: MouseEvent) => void | boolean;

/** Function that may be called on any touch event. */
type TouchEventCallback = (event?: TouchEvent) => void | boolean;

/**
 * Methods of `p5` that may be overwritten in `new p5()`.
 */
export type P5WritableMethods = {
    preload: () => void;
    setup: () => void;
    draw: () => void;
    setBackground: () => void;
    handleClick: any;
    windowResized: (event?: Event) => void;

    keyPressed: KeyboardEventCallback;
    keyReleased: KeyboardEventCallback;
    keyTyped: KeyboardEventCallback;

    mouseMoved: MouseEventCallback;
    mouseDragged: MouseEventCallback;
    mousePressed: MouseEventCallback;
    mouseReleased: MouseEventCallback;
    mouseClicked: MouseEventCallback;
    doubleClicked: MouseEventCallback;
    mouseWheel: MouseEventCallback;

    touchStarted: TouchEventCallback;
    touchMoved: TouchEventCallback;
    touchEnded: TouchEventCallback;
};

/**
 * Function object to be passed to `new p5()`.
 * This will assign several methods (such as `setup`/`draw`) to `p`.
 */
export type Sketch = (p: p5) => void;

/**
 * Object that defines a p5.js sketch and will be passed to `createSketch()`.
 * It should contain particular `p5` methods with `p5` instances added as
 * the first argument, e.g.:
 *
 * ```
 * setup: (p) => { p.createCanvas(400, 400); },
 * draw: (p) => { p.background(220); }
 * ```
 */
export type SketchDef = {
    [T in keyof P5WritableMethods]?: (
        p: p5,
        args: Parameters<P5WritableMethods[T]>,
    ) => ReturnType<P5WritableMethods[T]>;
};

/**
 * Interface for the Artboard component's Model class.
 */
export interface ITurtleModel {
    /*unique ID of the turtle */
    id: string;
    /* name of the turtle */
    name: string;
    /* Which start block is associated with this turtle. */
    startBlock: string;
    /* x coordinate */
    x: number;
    /* y coordinate */
    y: number;
    /* is the turtle running */
    running: boolean;
    /** media (text, images)*/
    media: [string];
    /**reference canvas using p5 of the turtle*/
    canvas: p5;
}

/**
 * Interface for the Artboard component's Model class.
 */
export interface ITurtlesModel {
    /** List of all of the turtles, one for each start block */
    turtles: [ITurtleModel];
}
