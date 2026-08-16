import { injected } from '../../..';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _container: HTMLElement;
let _imgContainer: HTMLElement;
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

  _svgCode = injected.assets['image.icon.code'].data;
  _svgClose = injected.assets['image.icon.close'].data;

  _imgContainer = document.createElement('div');
  _imgContainer.classList.add('editor-btn-img');
  _container.appendChild(_imgContainer);

  const label = document.createElement('p');
  label.classList.add('editor-btn-label');
  const span = document.createElement('span');
  span.innerText = injected.i18n['editor.editor'] || 'Editor';
  label.appendChild(span);
  _container.appendChild(label);

  setButtonImg('code');
}

/**
 * Sets the SVG icon for the editor's toolbar button.
 * @param icon icon name
 */
export function setButtonImg(icon: 'code' | 'cross'): void {
  _imgContainer.innerHTML = icon === 'code' ? _svgCode : _svgClose;
}
