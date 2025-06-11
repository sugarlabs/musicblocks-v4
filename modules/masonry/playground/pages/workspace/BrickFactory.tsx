import { useState } from 'react';
import { useMove } from 'react-aria';
import BrickBlock from './BrickBlock';
import BrickExpression from './BrickExpression';
import BrickStatement from './BrickStatement';
import BrickData from './BrickData';
import { useBricksCoords } from './BricksCoordsStore';
import { WORKSPACES_DATA } from './data';
import type { Brick } from './data';
import { getBelowBricksIds } from './utils';

const BrickFactory = ({
  brickData,
  isPalette = false,
  onDragEnd,
}: {
  brickData: Brick;
  isPalette?: boolean;
  onDragEnd?: (brick: Brick) => void;
}) => {
  const CONTAINER_SIZE_X = 2000;
  const CONTAINER_SIZE_Y = 800;
  const BRICK_HEIGHT = brickData.instance.bBoxBrick.extent.height;
  const BRICK_WIDTH = brickData.instance.bBoxBrick.extent.width;
  const { getCoords, setCoords } = useBricksCoords();
  const brickCoords = getCoords(brickData.id) || { x: 0, y: 0 };
  const [color, setColor] = useState(brickData.instance.colorBg as string);

  const clampX = (pos: number) => Math.min(Math.max(pos, 0), CONTAINER_SIZE_X - BRICK_WIDTH * 2);
  const clampY = (pos: number) => Math.min(Math.max(pos, 0), CONTAINER_SIZE_Y - BRICK_HEIGHT * 2);

  const { moveProps } = useMove({
    onMoveStart(e) {
      console.log(`move start with pointerType = ${e.pointerType}`);
      setColor('white');
    },
    onMove(e) {
      if (!isPalette) {
        const newX = brickCoords.x + e.deltaX;
        const newY = brickCoords.y + e.deltaY;
        setCoords(brickData.id, { x: clampX(newX), y: clampY(newY) });

        brickData.childBricks.forEach((childBrick) => {
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
      }
    },
    onMoveEnd(e) {
      console.log(`move end with pointerType = ${e.pointerType}`);
      setColor(brickData.instance.colorBg as string);
      if (isPalette && onDragEnd) {
        onDragEnd(brickData);
      }
    },
  });

  const BrickComponent = {
    data: BrickData,
    expression: BrickExpression,
    statement: BrickStatement,
    block: BrickBlock,
  }[brickData.type];

  return (
    <BrickComponent
      brickData={brickData}
      moveProps={moveProps}
      coords={isPalette ? { x: 0, y: 0 } : brickCoords}
      color={color}
    />
  );
};

export default BrickFactory;
