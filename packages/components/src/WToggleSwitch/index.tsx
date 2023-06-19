// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- component definition -------------------------------------------------------------------------

/**
 * React component definition for Toggle Switch widget.
 */
export default function (props: {
  /** Whether state is `on` (active) or `off`. */
  active: boolean;
  /** Callback function for click event. */
  handlerClick: CallableFunction;
}): JSX.Element {
  // ---------------------------------------------------------------------------

  return (
    <div
      className={`w-toggle ${props.active ? 'w-toggle-active' : ''}`}
      onClick={() => props.handlerClick()}
    >
      <div className="w-toggle-track">
        <div className="w-toggle-handle"></div>
      </div>
    </div>
  );
}
