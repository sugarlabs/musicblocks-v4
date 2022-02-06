import mouseSVG from './resources/mouse.svg';

// -- private variables ----------------------------------------------------------------------------

/** Source URL of the sprite's SVG. */
const _spriteSrc = mouseSVG;

/** DOM element representing the sprite. */
let sprite: HTMLElement;

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
 * @param spriteFillColor - sprite's `fill` color with default value of `"#a0a0a0"`
 * @param spriteStrokeColor - sprite's `stroke` color with with default value of `"#000000"`
 */
export function setup(
    interactor: HTMLElement,
    spriteFillColor = '#a0a0a0',
    spriteStrokeColor = '#000000',
): void {
    (async () => {
        const spriteWrapper = document.createElement('div');
        spriteWrapper.innerHTML =
            // fetches the SVG source string from the .svg source file's URL
            (await fetch(_spriteSrc).then((res) => res.text()))
                .replace('fill_color', spriteFillColor)
                .replaceAll('stroke_color', spriteStrokeColor);
        const spriteElem = spriteWrapper.children[0] as HTMLElement;
        spriteElem.style.position = 'absolute';
        spriteElem.style.left = '50%';
        spriteElem.style.bottom = '50%';
        spriteElem.style.transform = 'translate(-50%, 50%)';

        interactor.appendChild(spriteElem);

        sprite = spriteElem as unknown as HTMLElement;
    })();
}

/**
 * Updates the position of the sprite.
 * @param x - x co-ordinate
 * @param y - y co-ordinate
 */
export function updatePosition(x: number, y: number): void {
    state.position = { x, y };
    sprite.style.left = `calc(50% - ${state.position.x}px)`;
    sprite.style.bottom = `calc(50% + ${state.position.y}px)`;
}

/**
 * Updates the heading of the sprite.
 * @param heading - heading anglestate
 */
export function updateHeading(heading: number): void {
    state.heading = heading - 90;
    sprite.style.transform = `translate(-50%, 50%) rotate(${state.heading}deg)`;
}
