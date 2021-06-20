/**
 * Interface for the Artboard component's View props.
 */
export interface IArtboardProps {
    /** Viewport dimensions as [width, height]. */
    dimensions: [number, number];
    /** Refreshes the viewport dimensions state. */
    updateDimensions: () => void;
}
