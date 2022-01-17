import { useState } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { IPalettePopUpProps } from '../../../../@types/palette';

// -- stylesheet -----------------------------------------------------------------------------------

import './PalettePopUp.scss';

// -- view component definition --------------------------------------------------------------------

/**
 * View of the Pop Up.
 *
 * @returns root JSX element
 */
export default function (props: IPalettePopUpProps): JSX.Element {
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

  return (
    <div className="palette-pop-up">
      <div className="palette-pop-up-header">{props.subSection}</div>
      <div className="palette-block-list">
        {props.brickList.map((blocks, index) =>
          typeof blocks === 'string' ? (
            <button className="palette-block">{blocks}</button>
          ) : (
            Object.entries(blocks).map((block) => (
              <div key={`lowShelf-block-item-${index}`} className="palette-low-shelf">
                <div className="palette-low-shelf-title" onClick={() => openAccordion(block[0])}>
                  {block[0]}
                </div>
                <div
                  className={
                    openLowShelf && selectedHighShelf === block[0]
                      ? 'palette-low-shelf-active'
                      : 'palette-low-shelf-body'
                  }
                >
                  {block[1].map((lowBlock, i) => (
                    <button key={`lowShelf-block-${i}`} className="palette-block">
                      {lowBlock}
                    </button>
                  ))}
                </div>
              </div>
            ))
          ),
        )}
      </div>
    </div>
  );
}
