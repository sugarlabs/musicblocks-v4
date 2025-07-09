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

// Extended ITowerNode to ensure compatibility
interface ExtendedTowerNode extends ITowerNode {
  isNested?: boolean;
  argIndex?: number;
}

// Helper to render the correct brick view
function BrickNodeView({ node }: { node: ExtendedTowerNode }) {
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

// Helper function to get children of a node from the tower structure
function getNodeChildren(
  nodeId: string,
  allNodes: Map<string, ExtendedTowerNode>,
): {
  nested: ExtendedTowerNode[];
  args: ExtendedTowerNode[];
  stacked: ExtendedTowerNode[];
} {
  const nested: ExtendedTowerNode[] = [];
  const args: ExtendedTowerNode[] = [];
  const stacked: ExtendedTowerNode[] = [];

  for (const [_, node] of allNodes) {
    if (node.parent?.brick.uuid === nodeId) {
      if (node.isNested) {
        nested.push(node);
      } else if (node.argIndex !== undefined) {
        args.push(node);
      } else {
        stacked.push(node);
      }
    }
  }

  // Sort args by index
  args.sort((a, b) => (a.argIndex || 0) - (b.argIndex || 0));

  return { nested, args, stacked };
}

// Compute bounding boxes for all nodes (bottom-up)
function computeBoundingBoxes(
  allNodes: Map<string, ExtendedTowerNode>,
): Map<string, { w: number; h: number }> {
  const bbMap = new Map<string, { w: number; h: number }>();
  const visited = new Set<string>();

  // Post-order traversal: children first
  const visit = (node: ExtendedTowerNode) => {
    if (visited.has(node.brick.uuid)) {
      return bbMap.get(node.brick.uuid)!;
    }
    visited.add(node.brick.uuid);

    const children = getNodeChildren(node.brick.uuid, allNodes);

    // Start with the brick's own bounding box
    let width = node.brick.boundingBox.w;
    let height = node.brick.boundingBox.h;

    // Handle nested children (for compound bricks)
    if (children.nested.length > 0) {
      let nestedHeight = 0;
      let nestedWidth = 0;

      children.nested.forEach((child) => {
        const _childBB = visit(child);
        nestedHeight += _childBB.h;
        nestedWidth = Math.max(nestedWidth, _childBB.w);
      });

      // Update the compound brick's layout with nested children
      if (node.brick instanceof CompoundBrick) {
        const nestedBricks = children.nested.map((child) => child.brick as BrickModel);
        node.brick.updateLayoutWithChildren(nestedBricks);

        // Recalculate the brick's bounding box after layout update
        width = node.brick.boundingBox.w;
        height = node.brick.boundingBox.h;
      } else {
        // For non-compound bricks, expand to fit nested content
        width = Math.max(width, nestedWidth + 20); // Add some padding
        height = Math.max(height, node.brick.boundingBox.h + nestedHeight);
      }
    }

    // Handle argument children - they don't affect parent size as they're positioned at specific slots
    children.args.forEach((child) => {
      visit(child); // Just ensure they're processed
    });

    // Handle stacked children (vertical stack below this brick)
    if (children.stacked.length > 0) {
      let stackedHeight = 0;
      let stackedWidth = 0;

      children.stacked.forEach((child) => {
        const childBB = visit(child);
        stackedHeight += childBB.h;
        stackedWidth = Math.max(stackedWidth, childBB.w);
      });

      // Stacked children extend the total height and may affect width
      width = Math.max(width, stackedWidth);
      height += stackedHeight;
    }

    const result = { w: width, h: height };
    bbMap.set(node.brick.uuid, result);
    return result;
  };

  // Find roots and process them
  const roots = Array.from(allNodes.values()).filter((n) => n.parent === null);
  roots.forEach(visit);

  return bbMap;
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
      const tower = towers.find(t => t.hasBrick(curr.brick.uuid));
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
    if (children.nested.length > 0 && curr.brick.connectionPoints.nested) {
      let nestedOffsetY = 0;

      children.nested.forEach((child) => {
        const nestedX = x + curr.brick.connectionPoints.nested!.x;
        const nestedY = y + curr.brick.connectionPoints.nested!.y + nestedOffsetY;

        stack.push({
          node: child,
          x: nestedX,
          y: nestedY,
        });

        const _childBB = bbMap.get(child.brick.uuid)!;
        nestedOffsetY += _childBB.h;
      });
    }

    // Handle argument children - positioned at specific argument slots
    if (children.args.length > 0 && curr.brick.connectionPoints.args) {
      children.args.forEach((child) => {
        const argIndex = child.argIndex || 0;
        if (argIndex < curr.brick.connectionPoints.args!.length) {
          const argOrigin = curr.brick.connectionPoints.args![argIndex];

          stack.push({
            node: child,
            x: x + argOrigin.x,
            y: y + argOrigin.y,
          });
        }
      });
    }

    // Handle stacked children - positioned below the current brick
    if (children.stacked.length > 0) {
      let stackedOffsetY = y + curr.brick.boundingBox.h;

      children.stacked.forEach((child) => {
        stack.push({
          node: child,
          x: x,
          y: stackedOffsetY,
        });

        const _childBB3 = bbMap.get(child.brick.uuid)!;
        stackedOffsetY += _childBB3.h;
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
  // If node is not provided, start from all root nodes
  if (!node) {
    for (const n of nodes.values()) {
      if (n.parent === null) updateCompoundBrickLayouts(nodes, n);
    }
    return;
  }

  if (node.brick instanceof CompoundBrick) {
    const children = getNodeChildren(node.brick.uuid, nodes);
    if (children.nested.length > 0) {
      const nestedBricks = children.nested.map((child) => child.brick as BrickModel);
      node.brick.updateLayoutWithChildren(nestedBricks);
      // Recursively update only the nested children
      children.nested.forEach((child) => {
        updateCompoundBrickLayouts(nodes, child);
      });
    }
  }
}

interface TowerViewProps {
  tower: TowerModel;
  draggedBrickId: string | null;
  setDraggedBrickId: React.Dispatch<React.SetStateAction<string | null>>;
  dragOffset: { x: number; y: number };
  setDragOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  svgRef: React.RefObject<SVGSVGElement>;
}

const TowerView: React.FC<TowerViewProps> = ({
  tower,
  draggedBrickId,
  setDraggedBrickId,
  dragOffset,
  setDragOffset,
  isDragging,
  setIsDragging,
  svgRef,
}) => {
  // Mouse move handler for dragging
  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
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
  const handleMouseUp = () => {
    setDraggedBrickId(null);
    setIsDragging(false);
    window.removeEventListener('mousemove', handleMouseMove as any);
    window.removeEventListener('mouseup', handleMouseUp as any);
  };

  // Attach global listeners when dragging starts
  const startGlobalDrag = () => {
    window.addEventListener('mousemove', handleMouseMove as any);
    window.addEventListener('mouseup', handleMouseUp as any);
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
          setDraggedBrickId(curr.brick.uuid);
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
            style={{ cursor: isDragging && draggedBrickId === curr.brick.uuid ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
          >
            <BrickNodeView node={curr} />
          </g>,
        );
        // Handle nested children - positioned inside the current brick
        if (children.nested.length > 0 && curr.brick.connectionPoints.nested) {
          let nestedOffsetY = 0;
          children.nested.forEach((child) => {
            const nestedX = x + curr.brick.connectionPoints.nested!.x;
            const nestedY = y + curr.brick.connectionPoints.nested!.y + nestedOffsetY;
            stack.push({ node: child, x: nestedX, y: nestedY });
            const _childBB = bbMap.get(child.brick.uuid)!;
            nestedOffsetY += _childBB.h;
          });
        }
        // Handle argument children - positioned at specific argument slots
        if (children.args.length > 0 && curr.brick.connectionPoints.args) {
          children.args.forEach((child) => {
            const argIndex = child.argIndex || 0;
            if (argIndex < curr.brick.connectionPoints.args!.length) {
              const argOrigin = curr.brick.connectionPoints.args![argIndex];
              stack.push({ node: child, x: x + argOrigin.x, y: y + argOrigin.y });
            }
          });
        }
        // Handle stacked children - positioned below the current brick
        if (children.stacked.length > 0) {
          let stackedOffsetY = y + curr.brick.boundingBox.h;
          children.stacked.forEach((child) => {
            stack.push({ node: child, x: x, y: stackedOffsetY });
            const _childBB3 = bbMap.get(child.brick.uuid)!;
            stackedOffsetY += _childBB3.h;
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
  }, [tower, draggedBrickId, dragOffset, isDragging, svgRef]);

  return (
    <g>
      {renderedTower}
    </g>
  );
};

export default TowerView;
