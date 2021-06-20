// -- types ----------------------------------------------------------------------------------------

import { IPaletteProps } from '../../@types/palette';

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
      <h4>Palette</h4>
      <ul>
        {props.sections.map((section, i) => (
          <li key={`palette-section-item-${i}`}>{section}</li>
        ))}
      </ul>
    </div>
  );
}
