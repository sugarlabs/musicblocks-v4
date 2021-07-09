/**
 * Interface for the Artboard component's View props.
 */
import p5 from 'p5';
export interface IArtboardProps {
    /** id of the artboard */
    id: number;
    /** Viewport dimensions as [width, height]. */
    dimensions: [number, number];
    /** Refreshes the viewport dimensions state. */
    updateDimensions: () => void;
    /** Add a line to the Artboard */
    addLine: (line: number) => void;
    /** width of the Artboard */
    // width: number;
    /** height of the Artboard */
    // height: number;
    /** scale factor in X */
    // scaleX: number;
    /** scale factor in Y */
    // scaleY: number;
    /** Function to hide aux menu */
    /** Function to clear the canvas */
    /** Function to hide all grids */
    /** Function that renders Cartesian/Polar  */
    /** Sets the scale of the turtle canvas. */
    // setArtBoardScale: (scale: number) => void;
    /**  */
}
/**
 * Interface for the Interactor Artboard component's View props.
 */
export interface InteractArtboardProps {
    /** Viewport dimensions as [width, height]. */
    dimensions: [number, number];
    /** Refreshes the viewport dimensions state. */
    updateDimensions: () => void;
    /** width of the Artboard */
    // width: number;
    /** height of the Artboard */
    // height: number;
    /** scale factor in X */
    // scaleX: number;
    /** scale factor in Y */
    // scaleY: number;
    /** Function to hide aux menu */
    /** Function to clear the canvas */
    /** Function to hide all grids */
    /** Function that renders Cartesian/Polar  */
    /** Sets the scale of the turtle canvas. */
    // setArtBoardScale: (scale: number) => void;
    /**  */
}

/**
 * Interface for the Artboard Manager component's Model class.
 */
export interface IArtboardManagerModel {
    /** get the dimension width of a particular canvas*/
    getWidth: () => number;
    /** get the dimension height of a particular canvas*/
    getHeight: () => number;
    /** get the scale of a particular canvas */
    getScale: () => number;
    /** zoom the canvas based on input Scale */
    doScale: (scale: number) => void;
    /**  */
}

/**
 * Interface for the Artboard component's Model class.
 */
export interface IArtboardModel {
    /** get all the line parameters */
    getLines: () => [number];
    /** get all the arcs parameters */
    getArcs: () => [number];
    /** add a line to the line parameters */
    addLine: (line: number) => void;
}

export interface ITurtleModel {
    over: () => void;
    update: () => void;
    show: () => void;
    pressed: () => void;
}

export interface SketchProps {
    [key: string]: any;
}

export interface Sketch {
    (instance: p5): void;
}
export interface P5WrapperProps extends SketchProps {
    sketch: Sketch;
}

export interface P5Instance extends p5 {
    updateWithProps?: (props: SketchProps) => void;
}
