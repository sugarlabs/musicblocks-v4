import { ISketch } from './@types';

import * as sketchP5 from './core/sketchP5';
import { updatePosition, updateHeading } from './view/sprite';
import { updateBackgroundColor } from './view';

import { degToRad } from './core/utils';

// -- private variables ----------------------------------------------------------------------------

/** Default state parameter values of the sprite. */
const _defaultStateValues = {
    position: {
        x: 0,
        y: 0,
    },
    heading: 90,
    drawing: true,
};

/** Sprite state parameters. */
const _stateObj = { ..._defaultStateValues };

/** Proxy to the sprite state parameters. */
const _state = new Proxy(_stateObj, {
    set: (_, key, value) => {
        if (key === 'position') {
            _stateObj.position = value;
            updatePosition(value.x, value.y);
        } else if (key === 'heading') {
            _stateObj.heading = (value + 360) % 360;
            updateHeading((value + 360 - 90) % 360);
        } else if (key === 'drawing') {
            _stateObj.drawing = value;
        }
        return true;
    },
});

const _colorMap: [number, number, number][] = [
    [255, 241, 0],
    [255, 140, 0],
    [232, 17, 35],
    [236, 0, 140],
    [104, 33, 122],
    [0, 24, 143],
    [0, 188, 242],
    [0, 178, 148],
    [0, 158, 73],
    [186, 216, 10],
];

// -- public variables -----------------------------------------------------------------------------

/** Artboard canvas object. */
export const sketch: ISketch = sketchP5;

// -- private functions ----------------------------------------------------------------------------

/**
 * Helper function that moves the sprite forward (+ve distance) or backward (-ve distance).
 * @param distance - distance to move
 */
function _move(distance: number): void {
    const [x1, y1, x2, y2] = [
        _state.position.x,
        _state.position.y,
        _state.position.x + distance * Math.cos(degToRad(_state.heading)),
        _state.position.y + distance * Math.sin(degToRad(_state.heading)),
    ];

    _state.position = { x: x2, y: y2 };

    if (_state.drawing) {
        sketch.drawLine(x1, y1, x2, y2);
    }
}

/**
 * Helper function that turns the head of the sprite left (+ve angle) or right (-ve angle).
 * @param angle - delta angle
 */
function _turn(angle: number): void {
    _state.heading += angle;
}

// -- public functions -----------------------------------------------------------------------------

/**
 * Sets up the sketch inside the DOM container.
 * @param container DOM container
 */
export function setup(container: HTMLElement): void {
    sketch.setup(container);
}

/**
 * Resets the Painter.
 * @description dummy implementation for now.
 */
export function reset(): void {
    _state.position = { ..._defaultStateValues.position };
    _state.heading = _defaultStateValues.heading;
    _state.drawing = _defaultStateValues.drawing;

    sketch.clear();
    updateBackgroundColor('unset');
}

/**
 * Triggers the execution of the project.
 * @description dummy implementation for now.
 */
export function run(): void {
    // _sketch.setBackground(127);
    // _sketch.setBackground(255, 255, 0);
    // _sketch.setThickness(4);
    // _sketch.setColor(255, 0, 0);
    // setTimeout(() => moveForward(200), 0);
    // setTimeout(() => turnRight(90), 500);
    // setTimeout(() => moveBackward(400), 1000);
    // setTimeout(() => turnleft(270), 1500);
    // setTimeout(() => moveForward(200), 2000);
}

// -- public classes -------------------------------------------------------------------------------

import { ElementStatement, TData } from '@sugarlabs/musicblocks-v4-lib';

/**
 * @class
 * Defines a `graphics` statement element that moves the sprite forward.
 */
export class ElementMoveForward extends ElementStatement {
    constructor() {
        super('move-forward', 'forward', { steps: ['number'] });
    }

    /**
     * Moves the sprite `steps` forward.
     */
    onVisit(params: { [key: string]: TData }): void {
        _move(params['steps'] as number);
    }
}

/**
 * @class
 * Defines a `graphics` statement element that moves the sprite backward.
 */
export class ElementMoveBackward extends ElementStatement {
    constructor() {
        super('move-backward', 'backward', { steps: ['number'] });
    }

    /**
     * Moves the sprite `steps` backward.
     */
    onVisit(params: { [key: string]: TData }): void {
        _move(-params['steps'] as number);
    }
}

/**
 * @class
 * Defines a `graphics` statement element that rotates the sprite to the right.
 */
export class ElementTurnRight extends ElementStatement {
    constructor() {
        super('turn-right', 'right', { angle: ['number'] });
    }

    /**
     * Rotates the sprite right by `angle`.
     */
    onVisit(params: { [key: string]: TData }): void {
        _turn(-params['angle'] as number);
    }
}

/**
 * @class
 * Defines a `graphics` statement element that rotates the sprite to the left.
 */
export class ElementTurnLeft extends ElementStatement {
    constructor() {
        super('turn-left', 'left', { angle: ['number'] });
    }

    /**
     * Rotates the sprite left by `angle`.
     */
    onVisit(params: { [key: string]: TData }): void {
        _turn(params['angle'] as number);
    }
}

/**
 * @class
 * Defines a `graphics` statement element that updates the sprite position to (x, y).
 */
export class ElementSetXY extends ElementStatement {
    constructor() {
        super('set-xy', 'set-xy', { x: ['number'], y: ['number'] });
    }

    /**
     * Updates the sprite position to (`x`, `y`).
     */
    onVisit(params: { [key: string]: TData }): void {
        const [x1, y1, x2, y2] = [
            _state.position.x,
            _state.position.y,
            -params['x'] as number,
            params['y'] as number,
        ];

        _state.position = { x: x2, y: y2 };

        if (_state.drawing) {
            sketch.drawLine(x1, y1, x2, y2);
        }
    }
}

/**
 * @class
 * Defines a `graphics` statement element that updates the sprite heading.
 */
export class ElementSetHeading extends ElementStatement {
    constructor() {
        super('set-heading', 'set-heading', { angle: ['number'] });
    }

    /**
     * Sets the sprite heading to the `angle`.
     */
    onVisit(params: { [key: string]: TData }): void {
        _state.heading = (params['angle'] as number) + 90;
    }
}

/**
 * @class
 * Defines a `graphics` statement element that moves the sprite along an arc.
 */
export class ElementDrawArc extends ElementStatement {
    constructor() {
        super('draw-arc', 'draw-arc', { radius: ['number'], angle: ['number'] });
    }

    /**
     * Moves the sprite along arc with `radius` and `angle`.
     */
    onVisit(params: { [key: string]: TData }): void {
        const radius = params['radius'] as number;
        const angle = params['angle'] as number;

        const direction = Math.sign(angle);
        const theta = direction === 1 ? _state.heading + angle - 90 : _state.heading + angle + 90;

        const [xCentre, yCentre] = [
            _state.position.x + radius * Math.cos(degToRad(_state.heading + direction * 90)),
            _state.position.y + radius * Math.sin(degToRad(_state.heading + direction * 90)),
        ];

        const [startAngle, stopAngle] =
            direction === 1 ? [theta - angle, theta] : [theta, theta - angle];
        sketch.drawArc(xCentre, yCentre, radius * 2, radius * 2, startAngle, stopAngle);

        _state.heading += angle;
        _state.position = {
            x: xCentre + radius * Math.cos(degToRad(theta)),
            y: yCentre + radius * Math.sin(degToRad(theta)),
        };
    }
}

/**
 * @class
 * Defines a `pen` statement element that sets the pen color.
 */
export class ElementSetColor extends ElementStatement {
    constructor() {
        super('set-color', 'set color', { value: ['number'] });
    }

    /**
     * Sets the pen color to the `value`.
     */
    onVisit(params: { [key: string]: TData }): void {
        const value = ((params['value'] as number) - 1) % 10;
        sketch.setColor(..._colorMap[value]);
    }
}

/**
 * @class
 * Defines a `pen` statement element that sets the pen thickness.
 */
export class ElementSetThickness extends ElementStatement {
    constructor() {
        super('set-thickness', 'set-thickness', { value: ['number'] });
    }

    /**
     * Sets the pen thickness to the `value`.
     */
    onVisit(params: { [key: string]: TData }): void {
        sketch.setThickness(params['value'] as number);
    }
}

/**
 * @class
 * Defines a `pen` statement element that sets the pen thickness.
 */
export class ElementPenUp extends ElementStatement {
    constructor() {
        super('pen-up', 'pen-up', {});
    }

    /**
     * Disables drawing while moving.
     */
    onVisit(): void {
        _state.drawing = false;
    }
}

/**
 * @class
 * Defines a `pen` statement element that sets the pen thickness.
 */
export class ElementPenDown extends ElementStatement {
    constructor() {
        super('pen-down', 'pen-down', {});
    }

    /**
     * Enables drawing while moving.
     */
    onVisit(): void {
        _state.drawing = true;
    }
}

/**
 * @class
 * Defines a `pen` statement element that sets the background color.
 */
export class ElementSetBackground extends ElementStatement {
    constructor() {
        super('set-background', 'set-background', { value: ['number'] });
    }

    /**
     * Sets the background color to the `value`.
     */
    onVisit(params: { [key: string]: TData }): void {
        const value = ((params['value'] as number) - 1) % 10;
        updateBackgroundColor('set', _colorMap[value]);
    }
}

/**
 * @class
 * Defines a `pen` statement element that clears the canvas and the background.
 */
export class ElementClear extends ElementStatement {
    constructor() {
        super('clear', 'clear', {});
    }

    /**
     * Clears the canvas and the background.
     */
    onVisit(): void {
        sketch.clear();
        updateBackgroundColor('unset');
    }
}
