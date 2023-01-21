// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- component definition -------------------------------------------------------------------------

/**
 * React component definition for Text Button widget.
 */
export default function (props: {
  /** The content of the button. */
  content: string;
  /** Callback function for click event. */
  handlerClick: CallableFunction;
}): JSX.Element {
  // ---------------------------------------------------------------------------

  return (
    <div className="w-button" onClick={() => props.handlerClick()}>
      {props.content}
    </div>
  );
}
