// -- types ----------------------------------------------------------------------------------------

import { IPaletteSectionProps } from '@/@types/palette';

// -- other components -----------------------------------------------------------------------------

import PaletteSubSection from './PaletteSubSection';

// -- stylesheet -----------------------------------------------------------------------------------

import './PaletteSection.scss';

// -- view component definition --------------------------------------------------------------------

/**
 * View of the Palette's section component.
 *
 * @returns root JSX element
 */
export default function (props: IPaletteSectionProps): JSX.Element {
  return (
    <div className="palette-section-wrapper">
      <button
        className="palette-section-button"
        onClick={() => props.setOpenedSection(props.section)}
      >
        {props.section}
      </button>
      {props.opened && (
        <PaletteSubSection subSections={props.subSections} brickList={props.brickList} />
      )}
    </div>
  );
}
