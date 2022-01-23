import * as sketchP5 from './sketchP5';

export function mount(container: HTMLElement): void {
    const reset = () => {
        1;
    };

    const run = () => {
        reset();

        sketchP5.setBackground(127);
        sketchP5.setBackground(255, 255, 0);
        sketchP5.setThickness(4);
        sketchP5.setColor(255, 0, 0);
        sketchP5.drawLine(0, 0, 400, 400);
    };

    function mountDOM(): void {
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

        const controlRun = document.createElement('button');
        controlRun.innerHTML = 'RUN';
        controlRun.style.width = '3.5rem';
        controlRun.style.height = '3.5rem';
        control.appendChild(controlRun);

        const controlRst = document.createElement('button');
        controlRst.innerHTML = 'RESET';
        controlRst.style.width = '3.5rem';
        controlRst.style.height = '3.5rem';
        controlRst.style.marginTop = '1rem';
        control.appendChild(controlRst);

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

        const artboardCanvas = document.createElement('div');
        artboardCanvas.style.position = 'absolute';
        artboardCanvas.style.zIndex = '2';
        artboardCanvas.style.top = '0';
        artboardCanvas.style.right = '0';
        artboardCanvas.style.bottom = '0';
        artboardCanvas.style.left = '0';
        artboardWrapper.appendChild(artboardCanvas);

        const artboardInteractor = document.createElement('div');
        artboardInteractor.style.position = 'absolute';
        artboardInteractor.style.zIndex = '3';
        artboardInteractor.style.top = '0';
        artboardInteractor.style.right = '0';
        artboardInteractor.style.bottom = '0';
        artboardInteractor.style.left = '0';
        artboardWrapper.appendChild(artboardInteractor);

        sketchP5.setup(artboardCanvas);

        controlRun.addEventListener('click', () => run());
        controlRst.addEventListener('click', () => reset());
    }

    mountDOM();
}
