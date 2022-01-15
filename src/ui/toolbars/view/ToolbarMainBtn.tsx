// -- stylesheet -----------------------------------------------------------------------------------

import './ToolbarMainBtn.scss';

// -- view component definition --------------------------------------------------------------------

/**
 * Returns the View component of the Toolbars component.
 */
export default function (props: {
  cssClasses: string;
}): React.FunctionComponentElement<HTMLElement> {
  // -- render -------------------------------------------------------------------------------------

  return <button className={`${props.cssClasses}`}>BTN</button>;
}
