// -- types ----------------------------------------------------------------------------------------

import { IMenuProps } from '../../@types/menu';

// -- stylesheet -----------------------------------------------------------------------------------

import './Menu.scss';

// -- view component definition --------------------------------------------------------------------

/**
 * View of the Menu component.
 *
 * @param props - React props (title)
 * @returns root JSX element
 */
export default function (props: IMenuProps): JSX.Element {
  return (
    <div id="menu-wrapper">
      <h4>{props.title}</h4>
      <div id="menu-auto-hide-wrapper">
        <span>{`Hide: ${props.autoHide ? 'on' : 'off'}`}</span>
        <button onClick={props.toggleAutoHide}>Toggle Hide</button>
      </div>
    </div>
  );
}
