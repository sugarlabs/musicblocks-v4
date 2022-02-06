import mouseSVG from './resources/mouse.svg';

// -- private variables ----------------------------------------------------------------------------

/** Source URL of the sprite's SVG. */
const _spriteSrc = mouseSVG;

/** DOM element representing the sprite. */
let _sprite: HTMLElement;

/** Sprite state parameters. */
const state = {
    /** Co-ordinates of the sprite. */
    position: {
        /** x co-ordinate of the sprite. */
        x: 0,
        /** y co-ordinate of the sprite. */
        y: 0,
    },
    /** Heading of the sprite. */
    heading: 0,
};

// -- public functions -----------------------------------------------------------------------------

/**
 * Initializes the sprite.
 * @param interactor - DOM container for the interactor (wrapper for the sprite)
 */
export function setup(interactor: HTMLElement): void {
    (async () => {
        const spriteWrapper = document.createElement('div');
        spriteWrapper.innerHTML =
            // fetches the SVG source string from the .svg source file's URL
            await fetch(_spriteSrc).then((res) => res.text());

        const spriteElem = spriteWrapper.children[0] as HTMLElement;
        spriteElem.classList.add('artboard-sprite');
        spriteElem.style.left = '50%';
        spriteElem.style.bottom = '50%';
        spriteElem.style.transform = 'translate(-50%, 50%)';

        interactor.appendChild(spriteElem);

        _sprite = spriteElem;
    })();
}

/**
 * Updates the position of the sprite.
 * @param x - x co-ordinate
 * @param y - y co-ordinate
 */
export function updatePosition(x: number, y: number): void {
    state.position = { x, y };
    _sprite.style.left = `calc(50% - ${state.position.x}px)`;
    _sprite.style.bottom = `calc(50% + ${state.position.y}px)`;
}

/**
 * Updates the heading of the sprite.
 * @param heading - heading anglestate
 */
export function updateHeading(heading: number): void {
    state.heading = heading - 90;
    _sprite.style.transform = `translate(-50%, 50%) rotate(${state.heading}deg)`;
}

/**
 * Defaults the color accent of the sprite.
 */
export function updateAccent(type: 'unset'): void;
/**
 * Sets the color accent of the sprite.
 * @param fill fill color
 * @param stroke stroke color
 */
export function updateAccent(type: 'set', fill: string, stroke: string): void;
export function updateAccent(type: 'set' | 'unset', fill?: string, stroke?: string): void {
    if (type === 'unset') {
        _sprite.querySelectorAll('.path-fill').forEach((item) => {
            item.classList.add('path-fill-default');
            item.setAttribute('fill', '');
        });
        _sprite.querySelectorAll('.path-stroke').forEach((item) => {
            item.classList.add('path-stroke-default');
            item.setAttribute('stroke', '');
        });
        _sprite.querySelectorAll('.path-fill-stroke').forEach((item) => {
            item.classList.add('path-fill-stroke-default');
            item.setAttribute('fill', '');
            item.setAttribute('stroke', '');
        });
        return;
    }

    _sprite.querySelectorAll('.path-fill').forEach((item) => {
        item.classList.remove('path-fill-default');
        item.setAttribute('fill', fill!);
    });
    _sprite.querySelectorAll('.path-stroke').forEach((item) => {
        item.classList.remove('path-stroke-default');
        item.setAttribute('stroke', stroke!);
    });
    _sprite.querySelectorAll('.path-fill-stroke').forEach((item) => {
        item.classList.remove('path-fill-stroke-default');
        item.setAttribute('fill', stroke!);
        item.setAttribute('stroke', stroke!);
    });
}
