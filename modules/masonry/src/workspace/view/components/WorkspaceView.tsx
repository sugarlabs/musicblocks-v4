/**
 * WorkspaceCanvas.tsx
 *
 * Renders the main SVG-based workspace for placing and dragging towers of bricks.
 * Supports drag-and-drop from a palette and pointer-based dragging of individual bricks.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { dragStateAtom } from '../../../state/dragState';
import { towersAtom } from '../../../state/towersState';
import TowerModel from '../../../tower/model/model';
import type { BrickConfig } from '../../../palette/utils/types';
import bricksData from '../../../palette/config/brick-config.json';
import {
  createSimpleBrick,
  createExpressionBrick,
  createCompoundBrick,
} from '../../../brick/utils/brickFactory';
import { v4 as uuid } from 'uuid';
import TowerView from '../../../tower/view/components/TowerView';
import { JSX } from 'react/jsx-runtime';
import { expressionMap, statementMap } from '../../../collision-detection/types/index';
import { computeOutgoingNotches } from '../../../collision-detection/utils/OutgoingNotchCalculator';
import type { CollisionResult } from '../../../collision-detection/types/Types';
import { computeIncomingNotches } from '../../../collision-detection/utils/NotchCalculator';

/**
 * WorkspaceCanvas
 * @returns JSX.Element
 *
 * The top-level canvas component. Manages:
 *  - Recoil state for towers and drag origin
 *  - Drag-and-drop of new bricks from the palette
 *  - Pointer-based dragging of placed bricks
 */
export default function WorkspaceCanvas(): JSX.Element {
  const { origin } = useRecoilValue(dragStateAtom);
  const [towers, setTowers] = useRecoilState(towersAtom);
  const [isOver, setIsOver] = useState(false);
  const [draggedBrickId, setDraggedBrickId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [potentialConnection, setPotentialConnection] = useState<CollisionResult | null>(null);
  const DIAG_BOUND = 2000; // arbitrary large enough value for diagonal queries

  // After your useState hooks:
  useEffect(() => {
    if (isDragging && draggedBrickId) {
      const sourceTower = towers.find((t) => t.hasBrick(draggedBrickId));
      if (!sourceTower) return;
      console.log('Map Contents at drag-start');
      console.log(' expressionMap all hits:', expressionMap.query(0, 0, DIAG_BOUND));
      console.log(' statementMap all hits:', statementMap.query(0, 0, DIAG_BOUND));
      expressionMap.removeTower(sourceTower.id);
      statementMap.removeTower(sourceTower.id);
    }
  }, [isDragging, draggedBrickId, towers]);

  /**
   * Compute argument box sizes for a given brick config
   * @param cfg Brick configuration with argCount
   * @returns Array of { w: number; h: number } objects
   */
  const makeArgs = (cfg: BrickConfig) =>
    cfg.argCount > 0 ? Array(cfg.argCount).fill({ w: 20, h: 20 }) : [];

  /**
   * Handle drag-over event on the workspace container
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (origin !== 'palette') return; // only accept from palette
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsOver(true);
  };

  /**
   * Handle drop event: create a new TowerModel at drop coords
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (origin !== 'palette') return;
    e.preventDefault();
    setIsOver(false);

    // Extract brickId from dataTransfer
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    const { brickId } = JSON.parse(raw) as { brickId: string };

    // Find config for the dropped brick
    const cfg = (bricksData as BrickConfig[]).find((b) => b.id === brickId);
    if (!cfg) return;

    // Compute drop coordinates inside the div
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create brick via factory methods
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

    // Instantiate and add to towers state
    const tower = new TowerModel(uuid(), brick, { x, y });
    setTowers((prev) => {
      const newTowers = [...prev, tower];
      // populate the new one immediately
      expressionMap.upsertTower(tower);
      statementMap.upsertTower(tower);
      tower.nodesArray().forEach((node) => {
        const incomingNotches = computeIncomingNotches(node.brick, node.position);
        console.log(`[${tower.id}] indexed incoming notches:`, incomingNotches);
      });
      return newTowers;
    });
  };

  /**
   * Handle pointer movement while dragging a brick
   */
  const handleMouseMove = (e: MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return;

    // Update current mouse position relative to SVG
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setCurrentMousePos({ x: mouseX, y: mouseY });

    if (!draggedBrickId) return;

    // Calculate new position relative to SVG with drag offset
    const x = mouseX - dragOffset.x;
    const y = mouseY - dragOffset.y;

    function hasGetTotalBounds(
      brick: unknown,
    ): brick is { getTotalBounds(): { x: number; y: number; width: number; height: number } } {
      return typeof (brick as { getTotalBounds?: unknown }).getTotalBounds === 'function';
    }

    // Update the specific brick's position
    const towersCopy = [...towers];
    const towerModel = towersCopy.find((t) => t.hasBrick(draggedBrickId));
    if (towerModel) {
      // If dragging the root, move the entire structure using getTotalBounds
      const rootNode = towerModel.nodesArray().find((n) => n.parent === null);
      // Type assertion to BrickModel to access getTotalBounds
      if (rootNode && rootNode.brick.uuid === draggedBrickId && hasGetTotalBounds(rootNode.brick)) {
        // we can use getTotalBounds for snap/visual feedback here
        // For now, move the root and all children will follow
        towerModel.setBrickPosition(draggedBrickId, { x, y });
      } else {
        // Otherwise, move just the dragged brick
        towerModel.setBrickPosition(draggedBrickId, { x, y });
      }
      // 1) Find the tower & brick being dragged
      const tower = towersCopy.find((t) => t.hasBrick(draggedBrickId));
      if (!tower) return;
      const node = tower.nodesArray().find((n) => n.brick.uuid === draggedBrickId)!;
      const brk = node.brick;
      const pos = { x, y }; // the new global pos you just calculated

      // 2) Compute outgoing notches for this brick
      const outgoing = computeOutgoingNotches(brk, pos);
      console.log('Outgoing notches:', outgoing);

      // 3) For each outgoing, query the opposite map
      for (const o of outgoing) {
        console.log(`Querying ${o.type} at`, o.x, o.y);
        const hits =
          o.type === 'expression'
            ? expressionMap.query(o.x, o.y, /* radius: */ 5)
            : statementMap.query(o.x, o.y, /* radius: */ 5);
        console.log('  Hits:', hits);

        if (hits.length > 0) {
          console.log('⚡️ Potential connection:', hits[0].brickId, 'in tower', hits[0].towerId);
          const rawHit = hits[0];

          // reverse‐map to get the brick/tower objects
          const reverse =
            o.type === 'expression'
              ? statementMap.findHit(rawHit.x, rawHit.y)
              : expressionMap.findHit(rawHit.x, rawHit.y);

          // only proceed if we actually found both tower and brick
          if (reverse && reverse.tower && reverse.brick) {
            const conn: CollisionResult = {
              sourceNotch: { x: o.x, y: o.y },
              // use the raw notch coords from the quadtree entry:
              targetNotch: { x: rawHit.x, y: rawHit.y },
              // pull IDs off the model objects:
              targetBrick: {
                brickId: reverse.brick.uuid,
                towerId: reverse.tower.id,
              },
              connectionType: o.type,
            };
            console.log('🔥 PotentialConnection:', conn);
            setPotentialConnection(conn);
          }
          return;
        }
        setPotentialConnection(null);
      }

      setTowers(towersCopy);
      setRefreshKey((k) => k + 1);
    }
  };

  /**
   * Stop dragging: cleanup state and listeners
   */
  const handleMouseUp = () => {
    setDraggedBrickId(null);
    setIsDragging(false);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  /**
   * Handle brick disconnection with proper positioning and layout updates
   * This function should be called when a brick is disconnected from its parent
   */
  const handleBrickDisconnect = (brickId: string, newTowerModel: TowerModel) => {
    // Position the disconnected brick at current mouse position minus the drag offset
    const newPosition = {
      x: currentMousePos.x - dragOffset.x,
      y: currentMousePos.y - dragOffset.y,
    };

    // Set the position of the disconnected brick
    newTowerModel.setBrickPosition(brickId, newPosition);

    // Force a refresh to trigger re-calculation of layouts and bounding boxes
    setRefreshKey((k) => k + 1);
  };

  /**
   * Attach/detach global listeners when isDragging changes
   */
  useEffect(() => {
    let animationFrameId: number;
    const animate = (e: MouseEvent) => {
      animationFrameId = requestAnimationFrame(() => {
        handleMouseMove(e);
      });
    };
    if (isDragging) {
      window.addEventListener('mousemove', animate);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', animate);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  /**
   * Initiate global drag listeners (alternative to useEffect)
   */
  const startGlobalDrag = () => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (towers.length === 0) {
      // Root compound brick with 2 argument slots
      const root = createCompoundBrick({
        label: 'Root Compound',
        bboxArgs: [
          { w: 60, h: 20 },
          { w: 60, h: 20 },
        ],
      });

      const tower = new TowerModel('dummy_tower', root, { x: 100, y: 100 });

      // Add 2 argument bricks (expressions)
      const expr1 = createExpressionBrick({ label: 'Expr 1' });
      const expr2 = createExpressionBrick({ label: 'Expr 2' });
      tower.addArgumentBrick(root.uuid, expr1, { x: 0, y: 0 }, 0);
      tower.addArgumentBrick(root.uuid, expr2, { x: 0, y: 0 }, 1);

      // Add a nested compound brick (with its own nested child)
      const nestedCompound = createCompoundBrick({ label: 'Nested Compound' });
      tower.addNestedBrick(root.uuid, nestedCompound, { x: 0, y: 0 });

      const nestedChild = createSimpleBrick({ label: 'Nested Simple' });
      tower.addNestedBrick(nestedCompound.uuid, nestedChild, { x: 0, y: 0 });

      const nestedChild2 = createSimpleBrick({ label: 'Nested Simple' });
      tower.addBrick(nestedChild.uuid, nestedChild2, { x: 0, y: 0 });

      const nestedChild3 = createSimpleBrick({ label: 'Nested Simple' });
      tower.addBrick(nestedChild2.uuid, nestedChild3, { x: 0, y: 0 });

      // Add a simple nested brick directly to root
      const simpleNested = createSimpleBrick({ label: 'Simple Nested' });
      tower.addBrick(nestedCompound.uuid, simpleNested, { x: 0, y: 0 });

      const simpleNested2 = createSimpleBrick({ label: 'Simple Nested' });
      tower.addBrick(simpleNested.uuid, simpleNested2, { x: 0, y: 0 });

      // Add stacked bricks
      let lastUuid = root.uuid;
      for (let i = 1; i <= 2; i++) {
        const stacked = createSimpleBrick({ label: `Stack ${i}` });
        tower.addBrick(lastUuid, stacked, { x: 100, y: 150 + i * 30 });
        lastUuid = stacked.uuid;
      }

      setTowers([tower]);
      expressionMap.upsertTower(tower);
      statementMap.upsertTower(tower);
      tower.nodesArray().forEach((node) => {
        console.log(
          `[${tower.id}] initial indexed notches:`,
          computeIncomingNotches(node.brick, node.position),
        );
      });
    }
  }, []);

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
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onMouseMove={(e) => handleMouseMove(e.nativeEvent)}
        onMouseUp={handleMouseUp}
        style={{ pointerEvents: 'all' }}
      >
        {towers.map((t) => (
          <TowerView
            key={t.id + '-' + refreshKey}
            tower={t}
            towers={towers}
            setTowers={setTowers}
            draggedBrickId={draggedBrickId}
            setDraggedBrickId={setDraggedBrickId}
            dragOffset={dragOffset}
            setDragOffset={setDragOffset}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            svgRef={svgRef as React.RefObject<SVGSVGElement>}
            onBrickDisconnect={handleBrickDisconnect}
          />
        ))}
      </svg>
    </div>
  );
}
