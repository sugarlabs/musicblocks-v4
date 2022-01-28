import { ISketch } from '../@types';

import { setup as setupSprite } from './sprite';

let _artboardSketch: HTMLElement;
let _controlRun: HTMLElement;
let _controlRst: HTMLElement;

/**
 * Initializes the Painter DOM.
 * @param container - DOM container of the Painter
 */
export function mount(container: HTMLElement): void {
    container.style.display = 'flex';
    container.classList.add('artboard-container');
    container.style.flexDirection = 'row';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';

    const control = document.createElement('section');
    control.style.display = 'flex';
    control.style.flexDirection = 'column';
    control.style.justifyContent = 'center';
    control.style.boxSizing = 'border-box';
    control.style.height = '100%';
    control.style.padding = '0.5rem';
    control.style.backgroundColor = 'white';
    container.appendChild(control);

    _controlRun = document.createElement('button');
    _controlRun.innerHTML = 'RUN';
    _controlRun.style.width = '3.5rem';
    _controlRun.style.height = '3.5rem';
    control.appendChild(_controlRun);

    _controlRst = document.createElement('button');
    _controlRst.innerHTML = 'RESET';
    _controlRst.style.width = '3.5rem';
    _controlRst.style.height = '3.5rem';
    _controlRst.style.marginTop = '1rem';
    control.appendChild(_controlRst);

    const artboardContainer = document.createElement('section');
    artboardContainer.style.boxSizing = 'border-box';
    artboardContainer.style.width = 'calc(100% - 4.5rem)';
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
}

export function setupAction(action: 'run' | 'reset', callback: CallableFunction): void {
    if (action === 'run') {
        _controlRun.addEventListener('click', () => callback());
    } else if (action === 'reset') {
        _controlRst.addEventListener('click', () => callback());
    }
}
