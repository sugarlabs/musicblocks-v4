import * as sketchP5 from './sketchP5';
import { setup, updatePosition, updateHeading } from './sprite';
import { radToDeg } from './utils';

// -- private variables ----------------------------------------------------------------------------

/** Sprite parameters. */
const _params = {
    position: {
        x: 0,
        y: 0,
    },
    heading: 90,
};

/** Proxy to the sprite parameters. */
const params = new Proxy(_params, {
    set: (_, key, value) => {
        if (key === 'position') {
            _params.position = value;
            updatePosition(value.x, value.y);
        } else if (key === 'heading') {
            _params.heading = value;
            updateHeading(value);
        }
        return true;
    },
});

// -- private functions ----------------------------------------------------------------------------

/**
 * Moves the sprite forward (positive distance) or backward (negative distance).
 * @param distance - distance to move
 */
function move(distance: number): void {
    const [x1, y1, x2, y2] = [
        params.position.x,
        params.position.y,
        params.position.x + distance * Math.cos(radToDeg(params.heading)),
        params.position.y + distance * Math.sin(radToDeg(params.heading)),
    ];

    params.position = { x: x2, y: y2 };

    sketchP5.drawLine(x1, y1, x2, y2);
}

/**
 * Turns the head of the sprite right (positive angle) or left (negative angle).
 * @param angle - delta angle
 */
function turn(angle: number): void {
    params.heading += angle;
}

// -- public functions -----------------------------------------------------------------------------

/**
 * Moves the sprite forward
 * @param distance - distance to move
 */
export function moveForward(distance: number): void {
    move(distance);
}

/**
 * Moves the sprite backward
 * @param distance - distance to move
 */
export function moveBackward(distance: number): void {
    move(-distance);
}

/**
 * Turns the head of the sprite right.
 * @param angle - delta angle
 */
export function turnRight(angle: number): void {
    turn(angle);
}

/**
 * Turns the head of the sprite left.
 * @param angle - delta angle
 */
export function turnleft(angle: number): void {
    turn(-angle);
}

/**
 * Initializes the Painter DOM.
 * @param container - DOM container of the Painter
 */
export function mount(container: HTMLElement): void {
    const reset = () => {
        params.position = { x: 0, y: 0 };
        params.heading = 90;

        sketchP5.clear();
    };

    const run = () => {
        reset();

        // sketchP5.setBackground(127);
        // sketchP5.setBackground(255, 255, 0);
        sketchP5.setThickness(4);
        sketchP5.setColor(255, 0, 0);

        setTimeout(() => moveForward(200), 0);
        setTimeout(() => turnRight(90), 500);
        setTimeout(() => moveBackward(400), 1000);
        setTimeout(() => turnleft(270), 1500);
        setTimeout(() => moveForward(200), 2000);
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
        setup(artboardInteractor);

        controlRun.addEventListener('click', () => run());
        controlRst.addEventListener('click', () => reset());
    }

    mountDOM();
}
