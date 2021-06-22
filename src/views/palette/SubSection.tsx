// -- types ----------------------------------------------------------------------------------------

import { ISubSectionProps } from '../../@types/palette';

// -- stylesheet -----------------------------------------------------------------------------------

import './SubSection.scss';

// -- view component definition --------------------------------------------------------------------
import { useState } from 'react';
/**
 * View of the Palette' Sub section component.
 *
 * @returns root JSX element
 */
export default function (props: ISubSectionProps): JSX.Element {
  const [renderInfo, setRenderInfo] = useState<string>('');
  const handleSubSectionHover = (subSection: string) => {
    setRenderInfo(subSection);
  };

  const renderSubSection = props.subSections.map((subSection, i) => {
    return (
      <div key={`palette-subSection-item-${i}`} id="subSection-wrapper">
        <button
          className="subSectionButton"
          onMouseOver={handleSubSectionHover.bind(null, subSection)}
        >
          {subSection}
        </button>
        {renderInfo === subSection ? (
          <div key={`subSection-Info-${i}`} className="subSectionInfo">
            {subSection}
          </div>
        ) : null}
      </div>
    );
  });
  return <div>{renderSubSection}</div>;
}
