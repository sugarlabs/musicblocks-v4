// -- resources ------------------------------------------------------------------------------------

import svgCode from '../../resources/code.svg';
import svgClose from '../../resources/close.svg';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _container: HTMLElement;
let _svgCode: string;
let _svgClose: string;

// -- component definition -------------------------------------------------------------------------

/**
 * Loads the SVG icons for the editor's toolbar button.
 * @param container DOM element of the editor's toolbar button
 */
export function setup(container: HTMLElement): void {
  container.id = 'editor-toolbar-btn';
  _container = container;

  const loadSrc = async (svgSrc: string): Promise<string> => {
    const svg = await fetch(svgSrc).then((res) => res.text());
    return new Promise((resolve) => {
      resolve(svg);
    });
  };

  Promise.all([loadSrc(svgCode), loadSrc(svgClose)]).then(([svgCode, svgClose]) => {
    [_svgCode, _svgClose] = [svgCode, svgClose];

    setButtonImg('code');
  });
}

/**
 * Sets the SVG icon for the editor's toolbar button.
 * @param icon icon name
 */
export function setButtonImg(icon: 'code' | 'cross'): void {
  _container.innerHTML = icon === 'code' ? _svgCode : _svgClose;
}
