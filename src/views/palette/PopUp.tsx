// -- types ----------------------------------------------------------------------------------------
import { IPopUpBlocks } from '../../@types/palette';
// -- stylesheet -----------------------------------------------------------------------------------

import './PopUp.scss';

// -- Views ----------------------------------------------------------------------------------------
import { useState } from 'react';
// -- view component definition --------------------------------------------------------------------

/**
 * View of the Pop Up.
 *
 * @returns root JSX element
 */
export default function (props: IPopUpBlocks): JSX.Element {
  const [selectedHighShelf, setSelectedHighShelf] = useState<string>('');
  const [openLowShelf, setOpenLowShelf] = useState<boolean>(false);
  const openAccordion = (highShelf: string) => {
    if (selectedHighShelf === highShelf) {
      setSelectedHighShelf('');
    } else {
      setOpenLowShelf(true);
      setSelectedHighShelf(highShelf);
    }
  };
  const renderBlocks = (blocks: string | { [button: string]: string[] }, index: number) => {
    if (typeof blocks === 'string') {
      return <button className="blockInfo">{blocks}</button>;
    } else {
      for (const [highShelf, lowShelf] of Object.entries(blocks)) {
        return (
          <div key={`lowShelf-block-item-${index}`} className="lowShelf">
            <div className="title" onClick={() => openAccordion(highShelf)}>
              {highShelf}
            </div>
            <div className={openLowShelf && selectedHighShelf === highShelf ? 'active' : 'body'}>
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
