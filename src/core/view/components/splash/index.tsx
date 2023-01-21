import type { Root } from 'react-dom/client';

import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { SImage } from '@/common/components';
import { mountViewOverlay, unmountViewOverlay } from '..';
import { injected } from '../..';

// -- ui items -------------------------------------------------------------------------------------

import './index.scss';

// -- component definition -------------------------------------------------------------------------

/**
 * React component definition for the Splash component.
 */
export function Splash(props: {
  /** Load progress [0 - 100]. */
  progress: number;
}): JSX.Element {
  return (
    <div id="splash-container">
      <div id="splash-logo">
        <SImage asset={injected.assets['image.logo']} />
      </div>
      <div id="splash-progress-bar">
        <div id="splash-progress" style={{ width: `${props.progress}%` }} />
      </div>
    </div>
  );
}

// -- private variables ----------------------------------------------------------------------------

let _rootContainer: Root;

// -- public functions -----------------------------------------------------------------------------

/**
 * Mounts the Splash component in the view overlay.
 */
export async function mountSplash(): Promise<void> {
  await mountViewOverlay((container: HTMLElement) => {
    return new Promise((resolve) => {
      _rootContainer = createRoot(container);
      flushSync(() => {
        _rootContainer.render(<Splash progress={0}></Splash>);
        requestAnimationFrame(() => resolve());
      });
    });
  });
}

/**
 * Unmounts the Splash component from the view overlay.
 */
export async function unmountSplash(): Promise<void> {
  await unmountViewOverlay();
  return new Promise((resolve) => {
    flushSync(() => requestAnimationFrame(() => resolve()));
  });
}
