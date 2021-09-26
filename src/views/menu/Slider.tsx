import { createRef } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { ISliderProps } from '../../@types/menu';

// -- stylesheet -----------------------------------------------------------------------------------

import './Slider.scss';

// -- view component definition --------------------------------------------------------------------

/**
 * View of the Slider sub-component.
 *
 * @param props - React props
 * @returns root JSX element
 */
export default function (props: ISliderProps): JSX.Element {
  const inputRef = createRef<HTMLInputElement>();

  return (
    <div className="menu-slider">
      <label htmlFor={props.id}>{props.label}</label>
      <input
        type="range"
        name="cowbell"
        id={props.id}
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={() => props.changeHandler((inputRef.current as HTMLInputElement).valueAsNumber)}
        ref={inputRef}
      />
    </div>
  );
}
