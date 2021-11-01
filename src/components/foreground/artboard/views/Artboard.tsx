import { useEffect, useRef } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { IArtboardViewProps, TArtboardSpritePosition } from '@/@types/artboard';

// -- other components -----------------------------------------------------------------------------

import Painter from '@/components/background/painter/Painter';

// -- stylesheet -----------------------------------------------------------------------------------

import './Artboard.scss';

// -- view component definition --------------------------------------------------------------------

/**
 * View of the Artboard sub-component.
 *
 * @param props - React props
 * @returns root JSX element
 */
export default function (props: IArtboardViewProps): JSX.Element {
  const artboardRef = useRef(null);

  useEffect(() => {
    const artboard = artboardRef.current! as HTMLElement;

    const { width, height } = artboard.getBoundingClientRect();
    const painter = new Painter(
      artboard,
      { width, height },
      {
        updatePosition: (position: TArtboardSpritePosition) => props.updatePosition(position),
        updateHeading: (heading: number) => props.updateHeading(heading),
      },
    );

    painter.spritePosition = props.position;
    painter.spriteHeading = props.heading;

    const duration = 1000;
    const sides = 6;
    setTimeout(() => {
      setTimeout(() => painter.setColor(255, 0, 0));
      for (let i = 0; i < 6; i++) {
        setTimeout(() => painter.moveForward(100, duration), duration * i);
        setTimeout(() => painter.rotate(360 / sides, 'clockwise'), duration * (i + 1));
      }
      setTimeout(() => painter.setColor(0, 0, 255), duration * sides);
      for (let i = 0; i < 6; i++) {
        setTimeout(() => painter.moveForward(100, duration), duration * (i + sides));
        setTimeout(() => painter.rotate(360 / sides, 'anti-clockwise'), duration * (i + 1 + sides));
      }
    });
  }, []);

  // -- render -------------------------------------------------------------------------------------

  return <div className="artboard" ref={artboardRef} key={`artboard-${props.id}`}></div>;
}
