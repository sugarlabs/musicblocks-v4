// -- types ----------------------------------------------------------------------------------------

import { IPopUpBlocks } from '../../../@types/palette';

// -- stylesheet -----------------------------------------------------------------------------------

import './PopUp.scss';

// -- view component definition --------------------------------------------------------------------

/**
 * View of the Pop Up.
 *
 * @returns root JSX element
 */
export default function (props: IPopUpBlocks): JSX.Element {
  const renderBlocks = (blocks: string | { [button: string]: string[] }, index: number) => {
    if (typeof blocks === 'string') {
      return <button className="blockInfo">{blocks}</button>;
    } else {
      for (const [highShelf, lowShelf] of Object.entries(blocks)) {
        return (
          <div key={`lowShelf-block-item-${index}`} className="lowShelf">
            <div className="title" onClick={() => props.openAccordion(highShelf)}>
              {highShelf}
            </div>
            <div
              className={
                props.openLowShelf && props.selectedHighShelf === highShelf ? 'active' : 'body'
              }
            >
              {lowShelf.map((lowBlock, i) => (
                <button key={`lowShelf-block-${i}`} className="blockInfo">
                  {lowBlock}
                </button>
              ))}
            </div>
          </div>
        );
      }
    }
  };
  return (
    <div className="block-popUp-wrapper">
      <div className="popUp-text">{props.subSectionName}</div>
      <div id="blockList-wrapper">
        <div className="highShelf">
          {props.blockList != null
            ? props.blockList.map((blocks, i) => renderBlocks(blocks, i))
            : null}
        </div>
      </div>
    </div>
  );
}
