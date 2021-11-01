// -- types ----------------------------------------------------------------------------------------

import { ISVGProps } from '@/@types/svg';

// -- component definition -------------------------------------------------------------------------

/**
 * Left arrow SVG component.
 *
 * @param props - React props (title)
 * @returns root JSX element
 */
export default function (props: ISVGProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="30"
      height="30"
      viewBox="0 0 172 172"
      style={{ fill: '#000000' }}
    >
      <g
        fill="none"
        fillRule="nonzero"
        stroke="none"
        strokeWidth="1"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
        strokeDasharray=""
        strokeDashoffset="0"
        fontFamily="none"
        fontWeight="none"
        fontSize="none"
        textAnchor="none"
        style={{ mixBlendMode: 'normal' }}
      >
        <path d="M0,172v-172h172v172z" fill="none"></path>
        <g fill={props.fillColor}>
          <path d="M17.2,86c0,37.9948 30.8052,68.8 68.8,68.8c37.9948,0 68.8,-30.8052 68.8,-68.8c0,-37.9948 -30.8052,-68.8 -68.8,-68.8c-37.9948,0 -68.8,30.8052 -68.8,68.8zM90.05347,59.0132l34.4,34.4c1.118,1.118 1.67987,2.58573 1.67987,4.05347c0,1.46773 -0.56187,2.93547 -1.67987,4.05347c-2.24173,2.24173 -5.8652,2.24173 -8.10693,0l-30.34653,-30.34653l-30.34653,30.34653c-2.24173,2.24173 -5.8652,2.24173 -8.10693,0c-2.24173,-2.24173 -2.24173,-5.8652 0,-8.10693l34.4,-34.4c2.24173,-2.24173 5.8652,-2.24173 8.10693,0z"></path>
        </g>
      </g>
    </svg>
  );
}
