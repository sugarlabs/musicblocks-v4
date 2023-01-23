// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- component definition -------------------------------------------------------------------------

/**
 * React component definition for Text Button widget.
 */
export default function (props: {
  /** The content of the button. */
  content: string;
  /** The size of the button. */
  big: boolean;
  /** Callback function for click event. */
  handlerClick: CallableFunction;
}): JSX.Element {
  // ---------------------------------------------------------------------------

  return (
    <div className={`root ${props.big ? 'root-big':'root'}`} >
     <div className='main'>
       <div className="w-icon-button" onClick={() => props.handlerClick()}>
       {props.content}
       </div>
     </div>
    </div>
    
   
  );
}
