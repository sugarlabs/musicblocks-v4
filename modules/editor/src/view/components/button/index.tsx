import { injected } from '../../..';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _container: HTMLElement;
let _svgCode: string;
let _svgClose: string;
let editori18: string;
let closei18: string;

// -- component definition -------------------------------------------------------------------------

/**
 * Loads the SVG icons for the editor's toolbar button.
 * @param container DOM element of the editor's toolbar button
 */
export function setup(container: HTMLElement): void {
  container.id = 'editor-toolbar-btn';
  _container = container;

  _svgCode = injected.assets['image.icon.code'].data;
  _svgClose = injected.assets['image.icon.close'].data;

  editori18 = injected.i18n['editor.editor'];
  closei18 = injected.i18n['editor.close'];
  setButtonImg('code');
}

/**
 * Sets the SVG icon for the editor's toolbar button.
 * @param icon icon name
 */
export function setButtonImg(icon: 'code' | 'cross'): void {
  if (icon === 'code') {
    _container.innerHTML = `
    <p class="menu-btn-label">
      <span>${editori18}</span>
    </p>
        <div className="menu-btn-img">${_svgCode}</div>
    `;
  } else {
    _container.innerHTML = `
    <p class="menu-btn-label">
      <span>${closei18}</span>
    </p>
        <div className="menu-btn-img">${_svgClose}</div>
    `;
    // _container.innerHTML = _svgClose;
  }
}
