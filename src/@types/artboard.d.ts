/**
 * Interface for the Artboard component's View props.
 */
import p5 from 'p5';
export interface IArtboardProps {
    /** Viewport dimensions as [width, height]. */
    dimensions: [number, number];
    /** Refreshes the viewport dimensions state. */
    updateDimensions: () => void;
    /** Move the artboard to top */
    moveToTop: (id: number) => void;
}

export interface IArtboardHandlerProps {
    doArc: boolean;
    setDoArc: Dispatch<SetStateAction<boolean>>;
    turtle: ITurtleModel;
    updateDimensions: () => void;
    index: number;
}

/**
 * Interface for the Interactor Artboard component's View props.
 */
export interface InteractArtboardProps {
    /** Viewport dimensions as [width, height]. */
    dimensions: [number, number];
    /** Refreshes the viewport dimensions state. */
    updateDimensions: () => void;
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
    _id: number;
    _turtle: ITurtleModel;
}

export interface ITurtleModel {
    _id: number;
    _turtleX: number;
    _turtleY: number;
    _turtleAngle: number;
    /** get the turtleX position */
    getTurtleX: () => number;
    /** set X position of the turtle */
    setTurtleX: (x: number) => void;
    /** get turtleY position */
    getTurtleY: () => number;
    /** set Y position of the turtle */
    setTurtleY: (y: number) => void;
    /** get the angle of turtle */
    getTurtleAngle: () => number;
    /** set the new angle for turtle */
    setTurleAngle: (angle: number) => void;
    display: (sketch: p5) => void;
    move: (sketch: p5) => void;
    render: (sketch: p5) => void;
    over: (sketch: p5) => void;
    show: (sketch: p5) => void;
    pressed: (sketch: p5) => void;
    released: () => void;
    update: (sketch: p5) => void;
}

export interface IArtBoardDrawModel {
    /** get stroke weight of drawn line */
    getStrokeWeight: () => number;
    /** set stroke weight of drawn line */
    setStrokeWeight: (x: number) => void;
    /** get the color of the drawn line */
    getStokeColor: () => [number, number, number];
    /** set Stroke color */
    setStrokeColor: (red: number, blue: number, green: number) => void;
}

export interface SketchProps {
    [key: string]: any;
}

export interface Sketch {
    (instance: p5): void;
}
export interface P5WrapperProps extends SketchProps {
    index: number;
    turtle: ITurtleModel;
}
export interface P5WrapperTurtleProps extends SketchProps {
    index: number;
    artBoardList: IArtboardModel[];
}

export interface P5Instance extends p5 {
    updateWithProps?: (props: SketchProps) => void;
}
