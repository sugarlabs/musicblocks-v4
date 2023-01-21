import Toolbar from './toolbar';

import './index.scss';

export default function App(): JSX.Element {
  return (
    <>
      <Toolbar />
      <div id="workspace"></div>
    </>
  );
}

// -------------------------------------------------------------------------------------------------

import type { Root } from 'react-dom/client';

import { createRoot } from 'react-dom/client';

// -- private variables ----------------------------------------------------------------------------

let _rootContainer: Root;

// -- public functions -----------------------------------------------------------------------------

/**
 * Sets the main application view.
 */
export function setView(method: 'main'): Promise<void>;
/**
 * Embeds a React component in the viewport.
 * @param component React functional component
 */
export function setView(method: 'embed', component: () => JSX.Element): Promise<void>;
/**
 * Calls setup function with the root HTML element as the argument.
 * @param setupFunc setup callback for an component
 */
export function setView(
  method: 'setup',
  setupFunc: (container: HTMLElement) => Promise<void>,
): Promise<void>;
//
export function setView(
  method: 'main' | 'embed' | 'setup',
  arg?: (() => JSX.Element) | ((container: HTMLElement) => Promise<void>),
): Promise<void> {
  //
  return new Promise((resolve) => {
    const rootElem = document.getElementById('mb-root')!;

    if (method === 'setup') {
      (arg as (container: HTMLElement) => Promise<void>)(rootElem).then(() => resolve());
      return;
    }

    const rootComponent = method === 'embed' ? (arg as () => JSX.Element)() : <App></App>;

    if (_rootContainer === undefined) _rootContainer = createRoot(rootElem);
    _rootContainer.render(rootComponent);

    requestAnimationFrame(() => resolve());
  });
}
