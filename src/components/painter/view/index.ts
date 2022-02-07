import { ISketch } from '../@types';

import { createItem } from '@/view';
import { setup as setupComponent } from './components';
import { setup as setupSprite } from './sprite';

// -- private variables ----------------------------------------------------------------------------

let _artboardSketch: HTMLElement;
let _artboardBackground: HTMLElement;

// -- public functions -----------------------------------------------------------------------------

/**
 * Initializes the Painter DOM.
 */
export function mount(): Promise<void> {
    return new Promise((resolve) => {
        const container = createItem({ location: 'workspace' });
        container.id = 'painter';

        setupComponent(container).then(({ artboard, artboardBackground, interactor }) => {
            _artboardSketch = artboard;
            _artboardBackground = artboardBackground;
            setupSprite(interactor);

            resolve();
        });
    });
}

/**
 * Mounts the sketch canvas inside the artboard.
 * @param sketch sketch instance
 */
export function mountSketch(sketch: ISketch): Promise<void> {
    return new Promise((resolve) => {
        sketch.setup(_artboardSketch!);

        requestAnimationFrame(() => {
            const sketchCanvas = _artboardSketch.children[0] as HTMLCanvasElement;
            sketchCanvas.style.position = 'absolute';
            sketchCanvas.style.left = '50%';
            sketchCanvas.style.transform = 'translateX(-50%)';

            resolve();
        });
    });
}

/**
 * Removes the artboard container's background color.
 */
export function updateBackgroundColor(type: 'unset'): void;
/**
 * Sets the artboard container's background color.
 * @param color background color
 */
export function updateBackgroundColor(type: 'set', color: [number, number, number]): void;
/**
 * Updates the artboard container's background color.
 * @param type `set` to set background color, `unset` to remove background color
 * @param color background color
 */
export function updateBackgroundColor(
    type: 'set' | 'unset',
    color?: [number, number, number],
): void {
    if (type === 'unset') {
        _artboardBackground.style.backgroundColor = 'unset';
    } else {
        const [r, g, b] = color!;
        _artboardBackground.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    }
}
