import { useState } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { IPaletteProps } from '../../../../@types/palette';

// -- other components -----------------------------------------------------------------------------

import PaletteSection from './PaletteSection';

// -- stylesheet -----------------------------------------------------------------------------------

import './Palette.scss';

// -- view component definition --------------------------------------------------------------------

/**
 * View of the Palette component.
 *
 * @returns root JSX element
 */
export default function (props: IPaletteProps): JSX.Element {
  const [openedSection, setOpenedSection] = useState<string | null>(null);

  // -- render -------------------------------------------------------------------------------------

  return (
    <div id="palette-wrapper">
      {props.sections.map((section) => (
        <PaletteSection
          key={`palette-section-${section}`}
          section={section}
          opened={section === openedSection}
          setOpenedSection={(section: string | null) =>
            setOpenedSection(section === openedSection ? null : section)
          }
          subSections={props.subSections[section]}
          brickList={props.brickList[section]}
        />
      ))}
    </div>
  );
}
