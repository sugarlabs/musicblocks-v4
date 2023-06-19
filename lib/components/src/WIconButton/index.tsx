import type { TAsset } from '#/@types/assets';

// -- ui items -------------------------------------------------------------------------------------

import { SImage } from '../..';

import './index.scss';

// -- component definition -------------------------------------------------------------------------

/**
 * React component definition for Icon Button component.
 */
export default function (props: {
  /** Choosable button size */
  size: `big` | `small`;
  /** Asset entry. */
  asset: TAsset;
  /** Callback function for click event. */
  handlerClick: CallableFunction;
}): JSX.Element {
  // ---------------------------------------------------------------------------

  return (
    <>
      <button
        className={`w-button-icon ${
          props.size === 'big' ? 'w-button-icon-lg' : 'w-button-icon-sm'
        }`}
        onClick={() => props.handlerClick()}
      >
        <SImage asset={props.asset} />
      </button>
    </>
  );
}
