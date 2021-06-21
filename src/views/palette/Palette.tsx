// -- types ----------------------------------------------------------------------------------------

import { IPaletteProps } from '../../@types/palette';

// -- stylesheet -----------------------------------------------------------------------------------

import './Palette.scss';

// -- Views ----------------------------------------------------------------------------------------
import Section from './Section';
import SubSection from './SubSection';

// -- view component definition --------------------------------------------------------------------

/**
 * View of the Palette component.
 *
 * @returns root JSX element
 */
export default function (props: IPaletteProps): JSX.Element {
  return (
    <div id="palette-wrapper">
      <Section />
      <SubSection />
      <h4>Palette</h4>
      <ul>
        {props.sections.map((section, i) => (
          <button
            key={`palette-section-item-${i}`}
            onClick={props.changeSelectedSection.bind(null, i)}
          >
            {section}
          </button>
        ))}
      </ul>
    </div>
  );
}
