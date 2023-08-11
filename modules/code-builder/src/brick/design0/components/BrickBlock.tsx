import { useMove } from 'react-aria';
import { useState } from 'react';
import type { JSX } from 'react';
import type { IBrickBlock, TBrickCoords } from '@/@types/brick';
import { useBricksCoords } from '../../../../playground/pages/WorkSpace/BricksCoordsStore';
import type { Brick } from 'playground/pages/WorkSpace/data';

// -------------------------------------------------------------------------------------------------

export default function ({
  id,
  brickData,
  instance,
  coords = { x: 0, y: 0 },
}: {
  id: string;
  brickData: Brick;
  instance: IBrickBlock;
  coords?: TBrickCoords;
}): JSX.Element {
  const CONTAINER_SIZE_X = 800;
  const CONTAINER_SIZE_Y = 700;
  const BRICK_HEIGHT = instance.bBoxBrick.extent.height;
  const BRICK_WIDTH = instance.bBoxBrick.extent.width;
  const { getCoords, setCoords } = useBricksCoords();
  const brickCoords = getCoords(id)!;
  const [color, setColor] = useState(instance.colorBg as string);

  const clampX = (pos: number) => Math.min(Math.max(pos, 0), CONTAINER_SIZE_X - BRICK_WIDTH * 2);
  const clampY = (pos: number) => Math.min(Math.max(pos, 0), CONTAINER_SIZE_Y - BRICK_HEIGHT * 2);

  const { moveProps } = useMove({
    onMoveStart(e) {
      console.log(`move start with pointerType = ${e.pointerType}`);
      setColor('white');
    },
    onMove(e) {
      const newX = brickCoords.x + e.deltaX;
      const newY = brickCoords.y + e.deltaY;
      setCoords(id, { x: clampX(newX), y: clampY(newY) });

      brickData.childBricks.forEach((childBrick) => {
        console.log(childBrick);
        const childBrickCoords = getCoords(childBrick)!;
        setCoords(childBrick, {
          x: childBrickCoords.x + e.deltaX,
          y: childBrickCoords.y + e.deltaY,
        });
      });

      const belowBrickId = brickData.surroundingBricks.below;
      if (belowBrickId) {
        const belowBrickCoords = getCoords(belowBrickId)!;
        setCoords(belowBrickId, {
          x: belowBrickCoords.x + e.deltaX,
          y: belowBrickCoords.y + e.deltaY,
        });
      }

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
      tabIndex={0}
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
