import { useState } from 'react';

// -- stylesheet -----------------------------------------------------------------------------------

import './ToolbarAuxiliaryBox.scss';

// -- view component definition --------------------------------------------------------------------

/**
 * Returns the View component of the Toolbars component.
 */
export default function (props: {
  cssClasses: string[];
  collapsible: boolean;
}): React.FunctionComponentElement<HTMLElement> {
  const [collapsed, setCollapsed] = useState(false);

  // -- render -------------------------------------------------------------------------------------

  return !collapsed ? (
    <div className={`${props.cssClasses.join(' ')} toolbar-auxiliary-box`}>
      <div className="toolbar-auxiliary-box-content">
        A<br />B
      </div>
      {props.collapsible && (
        <button className="toolbar-auxiliary-box-collapse-btn" onClick={() => setCollapsed(true)}>
          &gt;
        </button>
      )}
    </div>
  ) : (
    <button className="toolbar-auxiliary-collapsed-btn" onClick={() => setCollapsed(false)}>
      btn
    </button>
  );
}
