import { createRef } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { ICheckboxProps } from '@/@types/menu';

// -- stylesheet -----------------------------------------------------------------------------------

import './Checkbox.scss';

// -- view component definition --------------------------------------------------------------------

/**
 * View of the Checkbox sub-component.
 *
 * @param props - React props
 * @returns root JSX element
 */
export default function (props: ICheckboxProps): JSX.Element {
  const inputRef = createRef<HTMLInputElement>();

  return (
    <div className="menu-checkbox">
      <label htmlFor={props.id}>{props.label}</label>
      <input
        type="checkbox"
        id={props.id}
        checked={props.checked}
        onChange={() => props.changeHandler((inputRef.current as HTMLInputElement).checked)}
        ref={inputRef}
      />
    </div>
  );
}
