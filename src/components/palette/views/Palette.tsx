// -- types ----------------------------------------------------------------------------------------

import { IPaletteProps } from '../../../@types/palette';

// -- other components -----------------------------------------------------------------------------

import Section from './Section';

// -- stylesheet -----------------------------------------------------------------------------------

import './Palette.scss';

// -- view component definition --------------------------------------------------------------------

/**
 * View of the Palette component.
 *
 * @returns root JSX element
 */
export default function (props: IPaletteProps): JSX.Element {
  return (
    <div id="palette-wrapper">
      {props.sections.map((section, i) => (
        <Section
          key={i}
          openedSection={props.openedSection}
          selectedSection={i}
          section={section}
          changeSelectedSection={props.changeSelectedSection}
          hideSubSection={props.hideSubSection}
          subSections={props.subSections}
        />
      ))}
    </div>
  );
}
