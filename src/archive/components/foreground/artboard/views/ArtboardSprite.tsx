import { useEffect, useRef } from 'react';
import $ from 'jquery';
import 'jqueryui';

// -- types ----------------------------------------------------------------------------------------

import { IArtboardSpriteViewProps } from '../../../../@types/artboard';

// -- stylesheet -----------------------------------------------------------------------------------

import './ArtboardSprite.scss';

// -- view component definition --------------------------------------------------------------------

/**
 * View of the Artboard Sprite sub-component.
 *
 * @param props - React props
 * @returns root JSX element
 */
export default function (props: IArtboardSpriteViewProps): JSX.Element {
  const spriteContainerRef = useRef(null);
  const spriteRef = useRef(null);

  useEffect(() => {
    const spriteContainer = spriteContainerRef.current! as unknown as HTMLElement;
    const sprite = $(spriteRef.current!);

    const spriteInitialAbsolutePosition = {
      x: $(spriteContainer).width()! / 2,
      y: $(spriteContainer).height()! / 2,
    };

    let recoupLeft: number, recoupTop: number;
    $(sprite).draggable({
      start: function (_, ui) {
        let left = parseInt($(this).css('left'), 10);
        left = isNaN(left) ? 0 : left;
        let top = parseInt($(this).css('top'), 10);
        top = isNaN(top) ? 0 : top;
        recoupLeft = left - ui.position.left;
        recoupTop = top - ui.position.top;
      },
      drag: function (_, ui) {
        ui.position.left += recoupLeft;
        ui.position.top += recoupTop;
        const offset = $(this).offset()!;
        props.updatePosition({
          x: offset.left - spriteInitialAbsolutePosition.x,
          y: spriteInitialAbsolutePosition.y - offset.top,
        });
      },
      containment: spriteContainer,
    });
  }, []);

  // -- render -------------------------------------------------------------------------------------

  return (
    <div
      className="artboard-sprite-container"
      ref={spriteContainerRef}
      key={`artboard-sprite-${props.id}`}
    >
      <div className="artboard-sprite-position-wrapper">
        <div
          className="artboard-sprite"
          style={{
            left: props.position['x'],
            bottom: props.position['y'],
            transform: `translate(-50%, 50%) rotate(${-(props.heading - 90)}deg)`,
            backgroundColor: props.color['outline'],
          }}
          onMouseOver={() => {
            (
              spriteRef.current as unknown as HTMLElement
            ).style.transform = `translate(-50%, 50%) rotate(${-(
              props.heading - 90
            )}deg) scale(${1.05})`;
          }}
          onMouseOut={() => {
            (
              spriteRef.current as unknown as HTMLElement
            ).style.transform = `translate(-50%, 50%) rotate(${-(props.heading - 90)}deg)`;
          }}
          ref={spriteRef}
        >
          <div
            className="artboard-sprite-body"
            style={{ backgroundColor: props.color['accent'] }}
          ></div>
        </div>
      </div>
    </div>
  );
}
