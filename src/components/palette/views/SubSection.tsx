import { useState } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { ISubSectionProps } from '../../../@types/palette';

// -- other components -----------------------------------------------------------------------------

import PaletteBlocks from '../PaletteBlocks';

// -- stylesheet -----------------------------------------------------------------------------------

import './SubSection.scss';

// -- view component definition --------------------------------------------------------------------

/**
 * View of the Palette' Sub section component.
 *
 * @returns root JSX element
 */
export default function (props: ISubSectionProps): JSX.Element {
  const [renderInfo, setRenderInfo] = useState<string>('');
  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const handleClickToShowPopUp = () => {
    // setShowInfo(false);
    if (!showPopUp) {
      setShowPopUp(true);
      setShowInfo(false);
    } else {
      setShowPopUp(false);
      setShowInfo(true);
    }
  };

  const handleSubSectionHover = (subSection: string) => {
    setRenderInfo(subSection);
    if (showPopUp) {
      setShowInfo(false);
    } else {
      setShowInfo(true);
    }
  };
  const handleSubSectionMouseOut = () => {
    if (showPopUp) {
      setShowInfo(false);
    } else {
      setShowInfo(true);
      setRenderInfo('');
    }
    setShowInfo(false);
  };

  const renderSubSection = props.subSections.map((subSection, i) => {
    return (
      <div key={`palette-subSection-item-${i}`} id="subSection">
        <div id="subSection-wrapper">
          <button
            className="subSectionButton"
            onMouseOver={handleSubSectionHover.bind(null, subSection)}
            onMouseOut={handleSubSectionMouseOut}
            onClick={handleClickToShowPopUp}
          >
            {subSection}
          </button>
        </div>
        <div id="popUp-wrapper">
          {renderInfo === subSection && showInfo ? (
            <div className="subSectionInfo">{subSection}</div>
          ) : null}
          {showPopUp && renderInfo === subSection ? (
            <PaletteBlocks subSectionName={subSection} />
          ) : null}
        </div>
      </div>
    );
  });

  return <div>{renderSubSection}</div>;
}
