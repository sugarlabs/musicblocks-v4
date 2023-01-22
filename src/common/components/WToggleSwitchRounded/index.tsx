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
      className={`w-toggle-r ${props.active ? 'w-toggle-r-active' : ''}`}
      onClick={() => props.handlerClick()}
    >
      <div className="w-toggle-r-track">
        <div className="w-toggle-r-handle"></div>
      </div>
    </div>
  );
}
