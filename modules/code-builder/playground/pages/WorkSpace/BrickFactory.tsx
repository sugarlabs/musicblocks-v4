import { useState } from 'react';
import { useMove } from 'react-aria';
import { BrickBlock, BrickData, BrickExpression, BrickStatement } from '@/brick';
import { useBricksCoords } from './BricksCoordsStore';
import { WORKSPACES_DATA } from './data';
import type { Brick } from './data';
import { getBelowBricksIds } from './utils';

const BrickFactory = ({ brickData }: { brickData: Brick }) => {
  const CONTAINER_SIZE_X = 800;
  const CONTAINER_SIZE_Y = 700;
  const BRICK_HEIGHT = brickData.instance.bBoxBrick.extent.height;
  const BRICK_WIDTH = brickData.instance.bBoxBrick.extent.width;
  const { getCoords, setCoords } = useBricksCoords();
  const brickCoords = getCoords(brickData.id)!;
  const [color, setColor] = useState(brickData.instance.colorBg as string);

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
      setCoords(brickData.id, { x: clampX(newX), y: clampY(newY) });

      brickData.childBricks.forEach((childBrick) => {
        console.log(childBrick);
        const childBrickCoords = getCoords(childBrick)!;
        setCoords(childBrick, {
          x: childBrickCoords.x + e.deltaX,
          y: childBrickCoords.y + e.deltaY,
        });
      });

      const belowBrickIds = getBelowBricksIds(WORKSPACES_DATA[0].data, brickData.id);
      belowBrickIds.forEach((belowBrickId) => {
        const belowBrickCoords = getCoords(belowBrickId)!;
        setCoords(belowBrickId, {
          x: belowBrickCoords.x + e.deltaX,
          y: belowBrickCoords.y + e.deltaY,
        });
      });

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
      setColor(brickData.instance.colorBg as string);
    },
  });

  switch (brickData.type) {
    case 'data':
      return (
        <BrickData brickData={brickData} moveProps={moveProps} coords={brickCoords} color={color} />
      );
    case 'expression':
      return (
        <BrickExpression
          brickData={brickData}
          moveProps={moveProps}
          coords={brickCoords}
          color={color}
        />
      );
    case 'statement':
      return (
        <BrickStatement
          brickData={brickData}
          moveProps={moveProps}
          coords={brickCoords}
          color={color}
        />
      );
    case 'block':
      return (
        <BrickBlock
          brickData={brickData}
          moveProps={moveProps}
          coords={brickCoords}
          color={color}
        />
      );
    default:
      return <></>;
  }
};

export default BrickFactory;
