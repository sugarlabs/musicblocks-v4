// -- stylesheet -----------------------------------------------------------------------------------
import './index.scss';

// -- import of the required custom component

import { SImageVector } from '..';

// -- component definition -------------------------------------------------------------------------

/**
 * React component definition for Icon Button component.
 */
export default function (props: {
  /** Choosable button size */
  size: `big` | `small`;
  /** SVG data string. */
  content: string;
  /** Callback function for click event. */
  handlerClick: CallableFunction
}): JSX.Element {
  // ---------------------------------------------------------------------------

  return (
    <>
      <button className={`${props.size === 'big' ? 'w-button-lg' : 'w-button'}`} onClick={() => props.handlerClick()}>
        <SImageVector content={props.content} />
      </button>
    </>
  );
}
