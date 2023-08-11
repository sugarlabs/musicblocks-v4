import { useMove } from 'react-aria';
import { useState } from 'react';
import { useBricksCoords } from '../../../../playground/pages/WorkSpace/BricksCoordsStore';
import type { JSX } from 'react';
import type { IBrickExpression, TBrickCoords } from '@/@types/brick';

// -------------------------------------------------------------------------------------------------

export default function ({
  id,
  instance,
  coords = { x: 0, y: 0 },
}: {
  id: string;
  instance: IBrickExpression;
  coords?: TBrickCoords;
}): JSX.Element {
  const { getCoords, setCoords } = useBricksCoords();
  const brickCoords = getCoords(id)!;
  const [color, setColor] = useState(instance.colorBg as string);

  const { moveProps } = useMove({
    onMoveStart(e) {
      console.log(`move start with pointerType = ${e.pointerType}`);
      setColor('white');
    },
    onMove(e) {
      const newX = brickCoords.x + e.deltaX;
      const newY = brickCoords.y + e.deltaY;
      setCoords(id, { x: newX, y: newY });

      // Normally, we want to allow the user to continue
      // dragging outside the box such that they need to
      // drag back over the ball again before it moves.
      // This is handled below by clamping during render.
      // If using the keyboard, however, we need to clamp
      // here so that dragging outside the container and
      // then using the arrow keys works as expected.
      // if (e.pointerType === 'keyboard') {
      //   x = clamp(x);
      //   y = clamp(y);
      // }

      // setEvents((events) => [
      //   `move with pointerType = ${e.pointerType}, deltaX = ${e.deltaX}, deltaY = ${e.deltaY}`,
      //   ...events,
      // ]);
    },
    onMoveEnd(e) {
      console.log(`move end with pointerType = ${e.pointerType}`);
      setColor(instance.colorBg as string);
      console.log(getCoords(id));
    },
  });

  return (
    <g
      {...moveProps}
      transform={`translate(${brickCoords.x},${brickCoords.y}) scale(${instance.scale})`}
    >
      <path
        d={instance.SVGpath}
        style={{
          fill: color,
          fillOpacity: 1,
          stroke: instance.outline as string,
          strokeWidth: 1,
          strokeLinecap: 'round',
          strokeOpacity: 1,
        }}
      />
    </g>
  );
}
