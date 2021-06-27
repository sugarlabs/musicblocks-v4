/**
 * Interface for the Artboard component's View props.
 */
export interface IArtboardProps {
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
 * Interface for the Artboard Manager component's Model class.
 */
export interface IArtboardManagerModel {
    /** Whether auto hide is on or off. */
    autoHide: boolean;
    /** Toggles the state of auto hide. */
    toggleAutoHide: () => void;
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
