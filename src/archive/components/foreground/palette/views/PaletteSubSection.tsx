import { useState } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { IPaletteSubSectionProps } from '../../../../@types/palette';

// -- other components -----------------------------------------------------------------------------

import PalettePopUp from './PalettePopUp';

// -- stylesheet -----------------------------------------------------------------------------------

import './PaletteSubSection.scss';

// -- view component definition --------------------------------------------------------------------

/**
 * View of the Palette' Sub section component.
 *
 * @returns root JSX element
 */
export default function (props: IPaletteSubSectionProps): JSX.Element {
  const [currentVisitingSubSection, setCurrentVisitingSubSection] = useState<string | null>(null);
  const [popUpOpened, setPopUpOpened] = useState(false);

  // -- render -------------------------------------------------------------------------------------

  return (
    <div className="palette-sub-sections-wrapper">
      {props.subSections.map((subSection) => (
        <div key={`palette-sub-section-${subSection}`} className="palette-sub-section-wrapper">
          <button
            className="palette-sub-section-button"
            onMouseEnter={() => setCurrentVisitingSubSection(subSection)}
            onMouseLeave={() => setCurrentVisitingSubSection(!popUpOpened ? null : subSection)}
            onClick={() =>
              setPopUpOpened(!(popUpOpened && subSection === currentVisitingSubSection))
            }
          >
            {subSection}
          </button>
          <div className="palette-pop-up-wrapper">
            {subSection === currentVisitingSubSection &&
              (!popUpOpened ? (
                <div className="palette-sub-section-label">{subSection}</div>
              ) : (
                <PalettePopUp subSection={subSection} brickList={props.brickList[subSection]} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
