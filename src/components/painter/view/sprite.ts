import mouseSVG from './resources/mouse.svg';

// -- private variables ----------------------------------------------------------------------------

/** Source URL of the sprite's SVG. */
const _spriteSrc = mouseSVG;

/** DOM element representing the sprite wrapper. */
let _sprite: HTMLElement;
/** SVG element of the sprite. */
let _spriteSVG: SVGElement;

let _spriteClicked = false;
let [_spriteClickOffsetX, _spriteClickOffsetY] = [0, 0];
let [_spriteWidth, _spriteHeight] = [0, 0];

let _state: {
    position: { x: number; y: number };
};

// -- private functions ----------------------------------------------------------------------------

/**
 * Updates the scaling of the sprite.
 * @param scale scale value
 */
function _updateScale(scale: number): void {
    _sprite.style.transform = _sprite.style.transform.replace(/scale\(.+\)/, `scale(${scale})`);
}

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

    // fetches the SVG source string from the .svg source file's URL
    fetch(_spriteSrc)
        .then((res) => res.text())
        .then((svg) => {
            spriteWrapper.innerHTML = svg;

            const spriteElem = spriteWrapper.children[0] as SVGElement;
            spriteElem.classList.add('artboard-sprite');

            _spriteSVG = spriteElem;
        });

    requestAnimationFrame(() => {
        const { width, height } = _sprite.getBoundingClientRect();
        [_spriteWidth, _spriteHeight] = [width, height];
    });

    _sprite.addEventListener('mouseenter', () => _updateScale(1.1));
    _sprite.addEventListener('mouseleave', () => _updateScale(1));

    _sprite.addEventListener('mousedown', (e) => {
        _spriteClicked = true;
        const { width, height, top, left } = _sprite.getBoundingClientRect();
        [_spriteClickOffsetX, _spriteClickOffsetY] = [
            e.clientX - (left + width / 2),
            e.clientY - (top + height / 2),
        ];
    });
    _sprite.addEventListener('mouseup', () => {
        _spriteClicked = false;
        [_spriteClickOffsetX, _spriteClickOffsetY] = [0, 0];
    });
    const delta = 8;
    _sprite.addEventListener('mousemove', (e) => {
        const { width, height } = interactor.getBoundingClientRect();
        const { clientX, clientY } = e;

        if (
            _spriteClicked &&
            Math.abs(clientX - _spriteClickOffsetX) > delta &&
            Math.abs(clientY - _spriteClickOffsetY) > delta
        ) {
            _state['position'] = {
                x: clientX - width / 2 - _spriteWidth - 10 - _spriteClickOffsetX + 1,
                y: height / 2 - clientY + 10 + _spriteClickOffsetY - 1,
            };
        }
    });
}

export function mountState(state: { position: { x: number; y: number } }): void {
    _state = state;
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
 * @param heading - heading angle
 */
export function updateHeading(heading: number): void {
    _sprite.style.transform = `translate(-50%, 50%) rotate(${-heading}deg) scale(1)`;
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
