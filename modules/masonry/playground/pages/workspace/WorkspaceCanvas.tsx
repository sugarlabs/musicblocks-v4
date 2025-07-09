import React, { useState } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { dragStateAtom } from '../../../src/state/dragState';
import { towersAtom } from '../../../src/state/towersState';
import TowerModel from '../../../src/tower/model/model';
import type { BrickConfig } from '../../../src/palette/utils/types';
import bricksData from '../../../src/palette/config/brick-config.json';
import {
  createSimpleBrick,
  createExpressionBrick,
  createCompoundBrick,
} from '../../../src/brick/utils/brickFactory';
import { v4 as uuid } from 'uuid';
import TowerDraggable from './DragTower';

export default function WorkspaceCanvas() {
  const { origin } = useRecoilValue(dragStateAtom);
  const [towers, setTowers] = useRecoilState(towersAtom);
  const [isOver, setIsOver] = useState(false);

  const makeArgs = (cfg: BrickConfig) =>
    cfg.argCount > 0 ? Array(cfg.argCount).fill({ w: 20, h: 20 }) : [];

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (origin !== 'palette') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsOver(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (origin !== 'palette') return;
    e.preventDefault();
    setIsOver(false);

    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    const { brickId } = JSON.parse(raw) as { brickId: string };

    const cfg = (bricksData as BrickConfig[]).find((b) => b.id === brickId);
    if (!cfg) return;

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let brick;
    switch (cfg.type) {
      case 'simple':
        brick = createSimpleBrick({
          label: cfg.label,
          colorBg: cfg.color,
          bboxArgs: makeArgs(cfg),
          topNotch: cfg.notches.top,
          bottomNotch: cfg.notches.bottom,
          tooltip: cfg.id,
        });
        break;
      case 'expression':
        brick = createExpressionBrick({
          label: cfg.label,
          colorBg: cfg.color,
          bboxArgs: makeArgs(cfg),
          tooltip: cfg.id,
        });
        break;
      case 'compound':
        brick = createCompoundBrick({
          label: cfg.label,
          colorBg: cfg.color,
          bboxArgs: makeArgs(cfg),
          bboxNest: [],
          topNotch: cfg.notches.top,
          bottomNotch: cfg.notches.bottom,
          tooltip: cfg.id,
        });
        break;
      default:
        return;
    }

    const tower = new TowerModel(uuid(), brick, { x, y });
    setTowers([...towers, tower]);
  };

  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        outline: isOver ? '2px dashed #08f' : 'none',
      }}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
    >
      <svg width="100%" height="100%">
        {towers.map((t) => (
          <TowerDraggable key={t.id} tower={t} />
        ))}
      </svg>
    </div>
  );
}
