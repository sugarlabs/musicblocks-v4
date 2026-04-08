import React, { useMemo, useState, useRef } from 'react';
import type { JSX } from 'react';
import type TowerModel from '../../model/model';
import type { ITowerNode } from '../../model/model';
import { SimpleBrickView } from '../../../brick/view/components/simple';
import { ExpressionBrickView } from '../../../brick/view/components/expression';
import { CompoundBrickView } from '../../../brick/view/components/compound';
import CompoundBrick from '../../../brick/model/model';
import type { BrickModel, SimpleBrick, ExpressionBrick } from '../../../brick/model/model';
import { useSetRecoilState, useRecoilState } from 'recoil';
import { dragStateAtom } from '../../../state/dragState';
import { towersAtom } from '../../../state/towersState';
import { 
  getNodeChildren,
  computeBoundingBoxes, 
  debugBoundingBoxCalculation,
} from '../../../tower/utils/towerUtils'; // Moved to utility file

// Extended ITowerNode to ensure compatibility
export interface ExtendedTowerNode extends ITowerNode {
  isNested?: boolean;
  argIndex?: number;
}

// Helper to render the correct brick view
export function BrickNodeView({ node }: { node: ExtendedTowerNode }) {
  const { brick } = node;
  switch (brick.type) {
    case 'Simple':
      return <SimpleBrickView {...(brick as SimpleBrick).renderProps} />;
    case 'Expression':
      return <ExpressionBrickView {...(brick as ExpressionBrick).renderProps} />;
    case 'Compound':
      return <CompoundBrickView {...(brick as CompoundBrick).renderProps} />;
    default:
      return null;
  }
}


// Render tower using iterative approach with correct positioning
function RenderTowerNodeStack({
  node,
  allNodes,
  bbMap,
  offset = { x: 0, y: 0 },
}: {
  node: ExtendedTowerNode;
  allNodes: Map<string, ExtendedTowerNode>;
  bbMap: Map<string, { w: number; h: number }>;
  offset?: { x: number; y: number };
}) {
  const elements: JSX.Element[] = [];
  const stack: Array<{ node: ExtendedTowerNode; x: number; y: number }> = [
    { node, x: offset.x, y: offset.y },
  ];

  // Recoil state for drag and towers
  const [towers, setTowers] = useRecoilState(towersAtom);
  const setDrag = useSetRecoilState(dragStateAtom);

  while (stack.length > 0) {
    const { node: curr, x, y } = stack.pop()!;
    const children = getNodeChildren(curr.brick.uuid, allNodes);

    // Drag handlers for each brick
    const handleDragStart = () => {
      setDrag({ brickType: curr.brick.type, origin: 'tower' });
    };
    const handleDragEnd = (e: React.DragEvent<SVGGElement>) => {
      const svg = e.currentTarget.ownerSVGElement!;
      const rect = svg.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      // Find the tower containing this brick
      const tower = towers.find((t) => t.hasBrick(curr.brick.uuid));
      if (tower) {
        tower.setBrickPosition(curr.brick.uuid, { x: newX, y: newY });
        setTowers([...towers]);
      }
    };

    // Render the current brick as a draggable group
    elements.push(
      <g
        key={curr.brick.uuid}
        transform={`translate(${x},${y})`}
        // @ts-ignore: SVGProps does not include 'draggable', but it works in browsers
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ cursor: 'move' }}
      >
        <BrickNodeView node={curr} />
      </g>,
    );

    // Handle nested children - positioned inside the current brick
    if (children.nested.length > 0 && curr.brick.connectionPoints?.nested) {
      let nestedOffsetY = 0;
      children.nested.forEach((child) => {
        const nestedX = x + (curr.brick.connectionPoints.nested.x || 0);
        const nestedY = y + (curr.brick.connectionPoints.nested.y || 0) + nestedOffsetY;
        stack.push({ node: child, x: nestedX, y: nestedY });
        const childBB = bbMap.get(child.brick.uuid) || { w: 0, h: 0 };
        nestedOffsetY += childBB.h;
      });
    }

    // Handle argument children - positioned at specific argument slots
    if (children.args.length > 0 && curr.brick.connectionPoints?.args) {
      children.args.forEach((child) => {
        const argIndex = child.argIndex || 0;
        if (argIndex < curr.brick.connectionPoints.args.length) {
          const argOrigin = curr.brick.connectionPoints.args[argIndex];
          stack.push({ node: child, x: x + (argOrigin.x || 0), y: y + (argOrigin.y || 0) });
        }
      });
    }

    // Handle stacked children - positioned below the current brick
    if (children.stacked.length > 0) {
      let stackedOffsetY = y + (curr.brick.boundingBox.h || 0);
      children.stacked.forEach((child) => {
        stack.push({ node: child, x, y: stackedOffsetY });
        const childBB = bbMap.get(child.brick.uuid) || { w: 0, h: 0 };
        stackedOffsetY += childBB.h;
      });
    }

    // Handle nested chains under simple bricks
    if (curr.brick.type === 'Simple' && children.nested.length > 0) {
      let nestedOffsetY = y + (curr.brick.boundingBox.h || 0);
      children.nested.forEach((child) => {
        stack.push({ node: child, x, y: nestedOffsetY });
        const childBB = bbMap.get(child.brick.uuid) || { w: 0, h: 0 };
        nestedOffsetY += childBB.h;
      });
    }
  }

  return <>{elements}</>;
}

// Helper function to recursively update layout for compound bricks
function updateCompoundBrickLayouts(
  nodes: Map<string, ExtendedTowerNode>,
  node?: ExtendedTowerNode,
): void {
  if (!node) {
    for (const n of nodes.values()) {
      if (n.parent === null) updateCompoundBrickLayouts(nodes, n);
    }
    return;
  }
  if (node.brick instanceof CompoundBrick) {
    const children = (node.brick as CompoundBrick).getNestedChildren(nodes); // Fixed to use CompoundBrick method
    (node.brick as CompoundBrick).updateLayoutWithChildren(children, nodes);
    children.forEach(child => {
      const childNode = Array.from(nodes.values()).find(n => n.brick.uuid === child.uuid);
      if (childNode) updateCompoundBrickLayouts(nodes, childNode);
    });
  }
}

interface TowerViewProps {
  tower: TowerModel;
  towers: TowerModel[];
  setTowers: React.Dispatch<React.SetStateAction<TowerModel[]>>;
  draggedBrickId: string | null;
  setDraggedBrickId: React.Dispatch<React.SetStateAction<string | null>>;
  dragOffset: { x: number; y: number };
  setDragOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  svgRef: React.RefObject<SVGSVGElement>;
  onBrickDisconnect?: (brickId: string, newTowerModel: TowerModel) => void;
  refreshTrigger?: number;
}

const TowerView: React.FC<TowerViewProps> = ({
  tower,
  towers,
  setTowers,
  draggedBrickId,
  setDraggedBrickId,
  dragOffset,
  setDragOffset,
  isDragging,
  setIsDragging,
  svgRef,
  onBrickDisconnect,
  refreshTrigger,
}) => {
  // Mouse move handler for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!draggedBrickId) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    if (tower.hasBrick(draggedBrickId)) {
      tower.setBrickPosition(draggedBrickId, { x, y });
    }
  };

  // Mouse up handler to stop dragging
  const handleMouseUp = (e: MouseEvent) => {
    setDraggedBrickId(null);
    setIsDragging(false);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  // Attach global listeners when dragging starts
  const startGlobalDrag = () => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Render logic (same as before, but pass handlers to each brick)
  const renderedTower = useMemo(() => {
    // Cast to extended type
    const extendedNodes = new Map<string, ExtendedTowerNode>();
    const nodes = tower.nodesArray();

    for (const node of nodes) {
      extendedNodes.set(node.brick.uuid, node as ExtendedTowerNode);
    }

    // Update compound brick layouts first
    updateCompoundBrickLayouts(extendedNodes);

    // Compute bounding boxes
    const bbMap = computeBoundingBoxes(extendedNodes);
    debugBoundingBoxCalculation(extendedNodes, bbMap);

    // Find root nodes
    const roots = Array.from(extendedNodes.values()).filter((n) => n.parent === null);

    // Custom RenderTowerNodeStack with mouse handlers
    function RenderTowerNodeStackWithDrag({
      node,
      allNodes,
      bbMap,
      offset = { x: 0, y: 0 },
    }: {
      node: ExtendedTowerNode;
      allNodes: Map<string, ExtendedTowerNode>;
      bbMap: Map<string, { w: number; h: number }>;
      offset?: { x: number; y: number };
    }) {
      const elements: JSX.Element[] = [];
      const stack: Array<{ node: ExtendedTowerNode; x: number; y: number }> = [
        { node, x: offset.x, y: offset.y },
      ];
      while (stack.length > 0) {
        const { node: curr, x, y } = stack.pop()!;
        const children = getNodeChildren(curr.brick.uuid, allNodes);
        
        // Mouse handlers for each brick
        const handleMouseDown = (e: React.MouseEvent) => {
          if (curr.parent !== null) {
            const originalTower = towers.find((t) => t.id === tower.id)?.clone();
            if (originalTower) {
              const newTower = originalTower.detachSubtree(curr.brick.uuid);
              if (newTower) {
                if (onBrickDisconnect) {
                  onBrickDisconnect(curr.brick.uuid, newTower);
                }
                setTowers((prevTowers) => {
                  const updatedTowers = prevTowers.map((t) =>
                    t.id === originalTower.id ? originalTower : t
                  );
                  updatedTowers.push(newTower);
                  console.log(`Detached brick ${curr.brick.uuid} into a new tower. Total towers: ${updatedTowers.length}`);
                  updatedTowers.forEach((t, i) => {
                    console.log(`  Tower ${i + 1} (${t.id}):`, t.nodesArray().map(n => n.brick.uuid));
                  });

                  return updatedTowers;
                });
                setDraggedBrickId(curr.brick.uuid);
              }
            }
          } else {
            setDraggedBrickId(curr.brick.uuid);
          }
          setIsDragging(true);
          const svg = svgRef.current;
          if (!svg) return;
          const rect = svg.getBoundingClientRect();
          setDragOffset({
            x: e.clientX - rect.left - x,
            y: e.clientY - rect.top - y,
          });
          startGlobalDrag();
        };
        
        elements.push(
          <g
            key={curr.brick.uuid}
            transform={`translate(${x},${y})`}
            style={{
              cursor: isDragging && draggedBrickId === curr.brick.uuid ? 'grabbing' : 'grab',
              filter:
                isDragging && draggedBrickId === curr.brick.uuid
                  ? 'drop-shadow(0 4px 2px rgba(0,0,0,0.25))'
                  : undefined,
            }}
            onMouseDown={handleMouseDown}
          >
            <BrickNodeView node={curr} />
          </g>,
        );
        
        // Handle nested children - positioned inside the current brick
        if (children.nested.length > 0 && curr.brick.connectionPoints?.nested) {
          let nestedOffsetY = 0;
          children.nested.forEach((child) => {
            const nestedX = x + (curr.brick.connectionPoints.nested.x || 0);
            const nestedY = y + (curr.brick.connectionPoints.nested.y || 0) + nestedOffsetY;
            stack.push({ node: child, x: nestedX, y: nestedY });
            const childBB = bbMap.get(child.brick.uuid) || { w: 0, h: 0 };
            nestedOffsetY += childBB.h;
          });
        }
        
        // Handle argument children - positioned at specific argument slots
        if (children.args.length > 0 && curr.brick.connectionPoints?.args) {
          children.args.forEach((child) => {
            const argIndex = child.argIndex || 0;
            if (argIndex < curr.brick.connectionPoints.args!.length) {
              const argOrigin = curr.brick.connectionPoints.args![argIndex];
              stack.push({ node: child, x: x + (argOrigin.x || 0), y: y + (argOrigin.y || 0) });
            }
          });
        }
        
        // Handle stacked children - positioned below the current brick
        if (children.stacked.length > 0) {
          let stackedOffsetY = y + (curr.brick.boundingBox.h || 0);
          children.stacked.forEach((child) => {
            stack.push({ node: child, x, y: stackedOffsetY });
            const childBB = bbMap.get(child.brick.uuid) || { w: 0, h: 0 };
            stackedOffsetY += childBB.h;
          });
        }

        // Handle nested chains under simple bricks
        if (curr.brick.type === 'Simple' && children.nested.length > 0) {
          let nestedOffsetY = y + (curr.brick.boundingBox.h || 0);
          children.nested.forEach((child) => {
            stack.push({ node: child, x, y: nestedOffsetY });
            const childBB = bbMap.get(child.brick.uuid) || { w: 0, h: 0 };
            nestedOffsetY += childBB.h;
          });
        }
      }
      return <>{elements}</>;
    }
    
    return roots.map((root) => (
      <RenderTowerNodeStackWithDrag
        key={root.brick.uuid}
        node={root}
        allNodes={extendedNodes}
        bbMap={bbMap}
        offset={root.position}
      />
    ));
  }, [tower, draggedBrickId, dragOffset, isDragging, svgRef, towers, setTowers, onBrickDisconnect, refreshTrigger]);

  return <g>{renderedTower}</g>;
};

export default TowerView;
