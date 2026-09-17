import { injected } from '../../..';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _container: HTMLElement;
let _imgWrapper: HTMLElement;
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

  const label = document.createElement('p');
  label.id = 'editor-toolbar-btn-label';

  const labelText = document.createElement('span');
  labelText.innerText = injected.i18n['editor.toolbar'];
  label.appendChild(labelText);

  // The icon gets its own wrapper so that swapping it does not replace the
  // hover label, which is a sibling of it inside the button.
  _imgWrapper = document.createElement('div');
  _imgWrapper.id = 'editor-toolbar-btn-img';

  _container.appendChild(label);
  _container.appendChild(_imgWrapper);

  setButtonImg('code');
}

/**
 * Sets the SVG icon for the editor's toolbar button.
 * @param icon icon name
 */
export function setButtonImg(icon: 'code' | 'cross'): void {
  _imgWrapper.innerHTML = icon === 'code' ? _svgCode : _svgClose;
}
