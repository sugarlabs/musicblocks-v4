// -- types ----------------------------------------------------------------------------------------

import { ISectionProps } from '../../@types/palette';
import SubSection from './SubSection';

// -- stylesheet -----------------------------------------------------------------------------------

import './Section.scss';

// -- view component definition --------------------------------------------------------------------

/**
 * View of the Palette's section component.
 *
 * @returns root JSX element
 */
export default function (props: ISectionProps): JSX.Element {
  const render = () => {
    if (props.openedSection === props.selectedSection) {
      return true;
    } else {
      return false;
    }
  };
  return (
    <div id="section-wrapper">
      <button
        className="sectionButton"
        onClick={() => props.changeSelectedSection(props.selectedSection)}
      >
        {props.section}
      </button>
      {!props.hideSubSection && render() ? <SubSection subSections={props.subSections} /> : null}
    </div>
  );
}
