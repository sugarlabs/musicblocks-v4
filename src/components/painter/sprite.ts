// -- private variables ----------------------------------------------------------------------------

/** DOM element representing the sprite. */
let sprite: HTMLElement;

/** Sprite parameters. */
const params = {
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
    interactor.style.position = 'absolute';

    const spriteElem = document.createElement('div');
    spriteElem.style.position = 'absolute';
    spriteElem.style.left = '50%';
    spriteElem.style.bottom = '50%';
    spriteElem.style.transform = 'translate(-50%, 50%)';
    spriteElem.style.width = '2rem';
    spriteElem.style.height = '2.5rem';
    spriteElem.style.clipPath = 'polygon(50% 0, 100% 85%, 0% 85%)';
    spriteElem.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    interactor.appendChild(spriteElem);

    sprite = spriteElem;
}

/**
 * Updates the position of the sprite.
 * @param x - x co-ordinate
 * @param y - y co-ordinate
 */
export function updatePosition(x: number, y: number): void {
    params.position = { x, y };
    sprite.style.left = `calc(50% - ${params.position.x}px)`;
    sprite.style.bottom = `calc(50% + ${params.position.y}px)`;
}

/**
 * Updates the heading of the sprite.
 * @param heading - heading angle
 */
export function updateHeading(heading: number): void {
    params.heading = heading - 90;
    sprite.style.transform = `translate(-50%, 50%) rotate(${params.heading}deg)`;
}
