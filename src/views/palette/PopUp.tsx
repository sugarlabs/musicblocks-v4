// -- types ----------------------------------------------------------------------------------------

// -- stylesheet -----------------------------------------------------------------------------------

import { IPopUpBlocks } from '../../@types/palette';
import './PopUp.scss';

// -- Views ----------------------------------------------------------------------------------------

// -- view component definition --------------------------------------------------------------------

/**
 * View of the Pop Up.
 *
 * @returns root JSX element
 */
export default function (props: IPopUpBlocks): JSX.Element {
  return (
    <div className="block-popUp-wrapper">
      <div className="popUp-text">{props.subSectionName}</div>
      <div id="blockList-wrapper">
        {props.blockList != null
          ? props.blockList.map((block, i) => (
              <button key={i} className="blockInfo">
                {block}
              </button>
            ))
          : null}
      </div>
    </div>
  );
}
