/**
 * Interface for the Artboard component's View props.
 */
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
