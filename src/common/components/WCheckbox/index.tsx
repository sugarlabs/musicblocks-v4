// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- component definition -------------------------------------------------------------------------

/**
 * React component definition for Checkbox widget.
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
      className={`w-checkbox ${props.active ? 'w-checkbox-active' : ''}`}
      onClick={() => props.handlerClick()}
    >
      <div className={'w-checkbox-checkmark'}>&#10003;</div>
    </div>
  );
}
