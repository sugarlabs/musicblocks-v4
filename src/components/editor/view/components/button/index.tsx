import { getAsset } from '@/core/assets';

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

  _svgCode = getAsset('image', 'image.icon.code')!.data;
  _svgClose = getAsset('image', 'image.icon.close')!.data;

  setButtonImg('code');
}

/**
 * Sets the SVG icon for the editor's toolbar button.
 * @param icon icon name
 */
export function setButtonImg(icon: 'code' | 'cross'): void {
  _container.innerHTML = icon === 'code' ? _svgCode : _svgClose;
}
