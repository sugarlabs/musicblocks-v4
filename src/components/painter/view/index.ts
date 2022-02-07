import { ISketch } from '../@types';

import { createItem } from '@/view';
import { setup as setupComponent } from './components';
import { setup as setupSprite } from './sprite';

// -- private variables ----------------------------------------------------------------------------

let _artboardSketch: HTMLElement;

// -- public functions -----------------------------------------------------------------------------

/**
 * Initializes the Painter DOM.
 */
export function mount(): Promise<void> {
    return new Promise((resolve) => {
        const container = createItem({ location: 'workspace' });
        container.id = 'painter';

        setupComponent(container).then(({ artboard, interactor }) => {
            _artboardSketch = artboard;
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
