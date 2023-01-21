import type { Root } from 'react-dom/client';

import { createRoot } from 'react-dom/client';

// -- ui items -------------------------------------------------------------------------------------

import Toolbar from './toolbar';

import './index.scss';

// -- component definitions ------------------------------------------------------------------------

/**
 * React component definition of the root application wrapper.
 */
function App(props: {
  /** Whether or not to mount overlay. */
  activeOverlay: boolean;
}): JSX.Element {
  return (
    <>
      {props.activeOverlay && (
        <div id="root-overlay">
          <div id="root-overlay-body"></div>
        </div>
      )}
      <main id="root-main"></main>
    </>
  );
}

/**
 * React component definition of the main application wrapper
 * @returns
 */
function AppMain(): JSX.Element {
  return (
    <>
      <Toolbar />
      <div id="workspace"></div>
    </>
  );
}

// -- private variables ----------------------------------------------------------------------------

/** Root view states. */
const _state = {
  /** Whether or not to mount overlay. */
  activeOverlay: false,
};

// -- private variables ----------------------------------------------------------------------------

/** React root for root application view. */
let _rootContainer: Root;
/** React root for main application view. */
let _rootMainContainer: Root;

// -- public functions -----------------------------------------------------------------------------

/**
 * Initializes the root application view.
 * @description This is the first thing that must be called before doing anything else in the view.
 */
export async function initView(): Promise<void> {
  if (_rootContainer === undefined)
    _rootContainer = createRoot(document.getElementById('mb-root') as HTMLElement);
  _rootContainer.render(<App activeOverlay={_state.activeOverlay}></App>);

  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

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
    const rootElem = document.getElementById('root-main')!;

    if (method === 'setup') {
      (arg as (container: HTMLElement) => Promise<void>)(rootElem).then(() => resolve());
      return;
    }

    const rootComponent = method === 'embed' ? (arg as () => JSX.Element)() : <AppMain></AppMain>;

    if (_rootMainContainer === undefined) _rootMainContainer = createRoot(rootElem);
    _rootMainContainer.render(rootComponent);

    requestAnimationFrame(() => resolve());
  });
}

/**
 * Mounts the application overlay view.
 * @param setup setup callback for the component to place in the overlay
 */
export async function mountViewOverlay(setup: (container: HTMLElement) => Promise<void>) {
  _state.activeOverlay = true;
  await initView();
  await setup(document.getElementById('root-overlay-body')!);
}

/**
 * Unmounts the application overlay view.
 */
export async function unmountViewOverlay(): Promise<void> {
  _state.activeOverlay = false;
  await initView();
}
