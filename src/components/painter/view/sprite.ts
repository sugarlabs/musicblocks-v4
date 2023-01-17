import { getAsset } from '@/core/assets';

// -- private variables ----------------------------------------------------------------------------

/** DOM element representing the sprite wrapper. */
let _sprite: HTMLElement;
/** SVG element of the sprite. */
let _spriteSVG: SVGElement;

// -- public functions -----------------------------------------------------------------------------

/**
 * Initializes the sprite.
 * @param interactor - DOM container for the interactor (wrapper for the sprite)
 */
export function setup(interactor: HTMLElement): void {
    const spriteWrapper = document.createElement('div');
    spriteWrapper.classList.add('artboard-sprite-wrapper');
    spriteWrapper.style.left = '50%';
    spriteWrapper.style.bottom = '50%';
    spriteWrapper.style.transform = 'translate(-50%, 50%)';
    interactor.appendChild(spriteWrapper);

    _sprite = spriteWrapper;

    spriteWrapper.innerHTML = getAsset('image.icon.mouse')!.data as string;

    const spriteElem = spriteWrapper.children[0] as SVGElement;
    spriteElem.classList.add('artboard-sprite');

    _spriteSVG = spriteElem;
}

/**
 * Updates the position of the sprite.
 * @param x - x co-ordinate
 * @param y - y co-ordinate
 */
export function updatePosition(x: number, y: number): void {
    _sprite.style.left = `calc(50% + ${x}px)`;
    _sprite.style.bottom = `calc(50% + ${y}px)`;
}

/**
 * Updates the heading of the sprite.
 * @param heading - heading anglestate
 */
export function updateHeading(heading: number): void {
    _sprite.style.transform = `translate(-50%, 50%) rotate(${-heading}deg)`;
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
        _spriteSVG.querySelectorAll('.path-fill').forEach((item) => {
            item.classList.add('path-fill-default');
            item.setAttribute('fill', '');
        });
        _spriteSVG.querySelectorAll('.path-stroke').forEach((item) => {
            item.classList.add('path-stroke-default');
            item.setAttribute('stroke', '');
        });
        _spriteSVG.querySelectorAll('.path-fill-stroke').forEach((item) => {
            item.classList.add('path-fill-stroke-default');
            item.setAttribute('fill', '');
            item.setAttribute('stroke', '');
        });
        return;
    }

    _spriteSVG.querySelectorAll('.path-fill').forEach((item) => {
        item.classList.remove('path-fill-default');
        item.setAttribute('fill', fill!);
    });
    _spriteSVG.querySelectorAll('.path-stroke').forEach((item) => {
        item.classList.remove('path-stroke-default');
        item.setAttribute('stroke', stroke!);
    });
    _spriteSVG.querySelectorAll('.path-fill-stroke').forEach((item) => {
        item.classList.remove('path-fill-stroke-default');
        item.setAttribute('fill', stroke!);
        item.setAttribute('stroke', stroke!);
    });
}
