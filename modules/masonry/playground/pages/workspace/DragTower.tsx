import React from 'react';
import { useSetRecoilState, useRecoilState } from 'recoil';
import { dragStateAtom } from '../../../src/state/dragState';
import { towersAtom } from '../../../src/state/towersState';
import TowerModel from '../../../src/tower/model/model';
import { useState } from 'react';
import TowerView from '../../../src/tower/view/components/TowerView';
import { useDrag } from '@react-aria/dnd';

export default function TowerDraggable({ tower }: { tower: TowerModel }) {
  const [towers, setTowers] = useRecoilState(towersAtom);
  const setDrag = useSetRecoilState(dragStateAtom);

  // Record “tower drag” in Recoil when drag starts
  const handleDragStart = () => {
    setDrag({ brickType: null, origin: 'tower' });
  };

  // On drag end, compute new x/y and reposition
  const handleDragEnd = (e: React.DragEvent<SVGGElement>) => {
    const svg = e.currentTarget.ownerSVGElement!;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    tower.setBrickPosition(tower.bricks[0].uuid, { x, y });
    setTowers([...towers]);
  };

  return (
    <g
      // @ts-ignore: SVGProps doesn’t include `draggable`
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ cursor: 'move' }}
    >
      <TowerView tower={tower} />
    </g>
  );
}
