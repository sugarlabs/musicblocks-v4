import { ISketch } from '../@types';

import { createItem } from '../../../view';
import { setup as setupSprite } from './sprite';

let _artboardSketch: HTMLElement;

/**
 * Initializes the Painter DOM.
 */
export function mount(): void {
    const container = createItem({ location: 'workspace' });

    container.style.display = 'flex';
    container.classList.add('artboard-container');
    container.style.flexDirection = 'row';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';

    const artboardContainer = document.createElement('section');
    artboardContainer.style.boxSizing = 'border-box';
    artboardContainer.style.width = '100%';
    artboardContainer.style.height = '100%';
    artboardContainer.style.padding = '0.5rem';
    artboardContainer.style.backgroundColor = 'silver';
    container.appendChild(artboardContainer);

    const artboardWrapper = document.createElement('div');
    artboardWrapper.style.position = 'relative';
    artboardWrapper.style.width = '100%';
    artboardWrapper.style.height = '100%';
    artboardContainer.appendChild(artboardWrapper);

    const artboardBackground = document.createElement('div');
    artboardBackground.style.position = 'absolute';
    artboardBackground.style.zIndex = '1';
    artboardBackground.style.top = '0';
    artboardBackground.style.right = '0';
    artboardBackground.style.bottom = '0';
    artboardBackground.style.left = '0';
    artboardBackground.style.backgroundColor = 'white';
    artboardWrapper.appendChild(artboardBackground);

    _artboardSketch = document.createElement('div');
    _artboardSketch.style.position = 'absolute';
    _artboardSketch.style.zIndex = '2';
    _artboardSketch.style.top = '0';
    _artboardSketch.style.right = '0';
    _artboardSketch.style.bottom = '0';
    _artboardSketch.style.left = '0';
    artboardWrapper.appendChild(_artboardSketch);

    const artboardInteractor = document.createElement('div');
    artboardInteractor.style.position = 'absolute';
    artboardInteractor.style.zIndex = '3';
    artboardInteractor.style.top = '0';
    artboardInteractor.style.right = '0';
    artboardInteractor.style.bottom = '0';
    artboardInteractor.style.left = '0';
    artboardWrapper.appendChild(artboardInteractor);

    setupSprite(artboardInteractor);
}

export function mountSketch(sketch: ISketch): void {
    sketch.setup(_artboardSketch!);

    setTimeout(() => {
        const sketchCanvas = _artboardSketch.children[0] as HTMLCanvasElement;
        sketchCanvas.style.position = 'absolute';
        sketchCanvas.style.left = '50%';
        sketchCanvas.style.transform = 'translateX(-50%)';
    });
}
