import { injected } from '../../..';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _container: HTMLElement;
let _imgContainer: HTMLElement;
let _labelSpan: HTMLElement;
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

  const labelEl = document.createElement('p');
  labelEl.className = 'editor-btn-label';
  _labelSpan = document.createElement('span');
  _labelSpan.innerText = injected.i18n['editor.toggle'];
  labelEl.appendChild(_labelSpan);
  _container.appendChild(labelEl);

  _imgContainer = document.createElement('div');
  _imgContainer.className = 'editor-btn-img';
  _container.appendChild(_imgContainer);

  _svgCode = injected.assets['image.icon.code'].data;
  _svgClose = injected.assets['image.icon.close'].data;

  setButtonImg('code');
}

/**
 * Sets the SVG icon for the editor's toolbar button.
 * @param icon icon name
 */
export function setButtonImg(icon: 'code' | 'cross'): void {
  _imgContainer.innerHTML = icon === 'code' ? _svgCode : _svgClose;
  if (_labelSpan) {
    _labelSpan.innerText =
      icon === 'code' ? injected.i18n['editor.toggle'] : injected.i18n['editor.close'];
  }
}
