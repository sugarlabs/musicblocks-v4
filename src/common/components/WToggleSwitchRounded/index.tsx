// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- component definition -------------------------------------------------------------------------

/**
 * React component definition for Toggle Switch widget.
 */
export default function Toggle(props: {
  /** Whether state is `on` (active) or `off`. */
  active: boolean;
  /** Callback function for click event. */
  handlerClick: CallableFunction;
}): JSX.Element {
  // ---------------------------------------------------------------------------

  return (
    <div
      className={`w-toggle-1 ${props.active ? 'w-toggle-active-1' : ''}`}
      onClick={() => props.handlerClick()}
    >
      <div className="w-toggle-track-1">
        <div className="w-toggle-handle-1"></div>
      </div>
    </div>
  );
}
