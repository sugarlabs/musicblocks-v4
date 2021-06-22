import { SketchDef, Sketch } from '../@types/artboard';
/**
 * Returns the viewport dimensions.
 *
 * @returns Viewport dimensions as 1D array as [width, height]
 */
export function getViewportDimensions(): [number, number] {
    return [window.innerWidth, window.innerHeight];
}

/** Creates a function object to be passed to `new p5()`. */
export const createSketch = (definition: SketchDef): Sketch => {
    const methodNames = Object.keys(definition) as (keyof SketchDef)[];
    return (p) => {
        methodNames.forEach((methodName) => {
            const method = definition[methodName];
            if (method) p[methodName] = method.bind(undefined, p);
        });
    };
};
