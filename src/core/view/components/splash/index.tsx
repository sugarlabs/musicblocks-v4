import type { Root } from 'react-dom/client';
import type { TAsset } from '@/@types/core/assets';

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
  /** Image asset for logo. */
  logo: TAsset;
  /** Load progress [0 - 100]. */
  progress: number;
}): JSX.Element {
  return (
    <div id="splash-container">
      <div id="splash-logo">
        <SImage asset={props.logo} />
      </div>
      <div id="splash-progress-bar">
        <div id="splash-progress" style={{ width: `${props.progress}%` }} />
      </div>
    </div>
  );
}

// -- private variables ----------------------------------------------------------------------------

let _rootContainer: Root;

// -- private functions ----------------------------------------------------------------------------

/**
 * Helper function to render/update the Splash component.
 * @param progress progress bar value [0 - 100]
 */
async function _renderComponent(progress?: number): Promise<void> {
  return new Promise((resolve) => {
    flushSync(() => {
      _rootContainer.render(
        <Splash
          logo={injected.assets['image.logo']}
          progress={Math.min(Math.max(progress || 0, 0), 100)}
        ></Splash>,
      );
      requestAnimationFrame(() => resolve());
    });
  });
}

// -- public functions -----------------------------------------------------------------------------

/**
 * Mounts the Splash component in the view overlay.
 */
export async function mountSplash(): Promise<void> {
  await mountViewOverlay(async (container: HTMLElement) => {
    _rootContainer = createRoot(container);
    await _renderComponent();
  });
}

/**
 * Updates the Splash component in the view overlay.
 * @param progress progress bar value [0 - 100]
 */
export async function updateSplash(progress: number): Promise<void> {
  await _renderComponent(progress);
}

/**
 * Unmounts the Splash component from the view overlay.
 */
export async function unmountSplash(): Promise<void> {
  await unmountViewOverlay();
  return new Promise((resolve) => {
    flushSync(() => {
      _rootContainer.unmount();
      requestAnimationFrame(() => resolve());
    });
  });
}
