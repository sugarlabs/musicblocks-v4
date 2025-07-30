import type { ExtendedTowerNode } from '../view/components/TowerView';
import CompoundBrick from '../../brick/model/model';

declare global {
    interface Window {
        __debugBoundingBoxRan?: boolean;
    }
}

// Helper function to get children of a node from the tower structure
export function getNodeChildren(
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

    args.sort((a, b) => (a.argIndex || 0) - (b.argIndex || 0));
    return { nested, args, stacked };
}

// Helper function to get all descendants of a node
export function getAllDescendants(
    nodeId: string,
    allNodes: Map<string, ExtendedTowerNode>,
): ExtendedTowerNode[] {
    const descendants: ExtendedTowerNode[] = [];

    const gatherDescendants = (currentNodeId: string) => {
        allNodes.forEach((childNode) => {
            if (childNode.parent && childNode.parent.brick.uuid === currentNodeId) {
                descendants.push(childNode);
                gatherDescendants(childNode.brick.uuid);
            }
        });
    };

    gatherDescendants(nodeId);
    return descendants;
}

// Calculate nested area including all descendants within the nested region
export function calculateNestedAreaDimensions(
    compoundNodeId: string,
    allNodes: Map<string, ExtendedTowerNode>,
    memoMap: Map<string, { w: number; h: number }>,
): { w: number; h: number } {
    const cacheKey = `nested_${compoundNodeId}`;
    if (memoMap.has(cacheKey)) {
        return memoMap.get(cacheKey)!;
    }

    const compoundNode = allNodes.get(compoundNodeId);
    if (!compoundNode) {
        const result = { w: 0, h: 0 };
        memoMap.set(cacheKey, result);
        return result;
    }

    const children = getNodeChildren(compoundNodeId, allNodes);

    if (children.nested.length === 0) {
        const result = { w: 0, h: 0 };
        memoMap.set(cacheKey, result);
        return result;
    }

    let totalNestedHeight = 0;
    let totalNestedWidth = 0;

    // Process only nested children and their full subtrees
    children.nested.forEach((nestedChild) => {
        const { h, w } = calculateCompleteSubtreeDimensions(
            nestedChild.brick.uuid,
            allNodes,
            memoMap,
        );
        totalNestedHeight += h;
        totalNestedWidth = Math.max(totalNestedWidth, w);
    });

    const result = { w: totalNestedWidth, h: totalNestedHeight };
    memoMap.set(cacheKey, result);
    return result;
}

// Calculate complete subtree dimensions WITHOUT calling updateLayoutWithChildren
export function calculateCompleteSubtreeDimensions(
    rootNodeId: string,
    allNodes: Map<string, ExtendedTowerNode>,
    memoMap: Map<string, { w: number; h: number }>,
): { w: number; h: number } {
    if (memoMap.has(rootNodeId)) {
        return memoMap.get(rootNodeId)!;
    }

    const rootNode = allNodes.get(rootNodeId);
    if (!rootNode) {
        const result = { w: 0, h: 0 };
        memoMap.set(rootNodeId, result);
        return result;
    }

    const children = getNodeChildren(rootNodeId, allNodes);

    let totalWidth = rootNode.brick.boundingBox.w || 0; // Fallback to 0 if undefined
    let totalHeight = rootNode.brick.boundingBox.h || 0; // Fallback to 0 if undefined

    // Handle nested children
    if (children.nested.length > 0 && rootNode.brick.connectionPoints?.nested) {
        const nestedAreaDims = calculateNestedAreaDimensions(rootNodeId, allNodes, memoMap);
        const nestedPoint = rootNode.brick.connectionPoints.nested;
        totalHeight = Math.max(totalHeight, nestedPoint.y + nestedAreaDims.h);
        totalWidth = Math.max(totalWidth, nestedPoint.x + nestedAreaDims.w);
    }

    // Handle argument children
    if (children.args.length > 0 && rootNode.brick.connectionPoints?.args) {
        children.args.forEach((argChild) => {
            const argIndex = argChild.argIndex || 0;
            if (argIndex < rootNode.brick.connectionPoints.args!.length) {
                const argPoint = rootNode.brick.connectionPoints.args![argIndex];
                const argSubtreeDims = calculateCompleteSubtreeDimensions(
                    argChild.brick.uuid,
                    allNodes,
                    memoMap,
                );
                totalWidth = Math.max(totalWidth, argPoint.x + argSubtreeDims.w);
                totalHeight = Math.max(totalHeight, argPoint.y + argSubtreeDims.h);
            }
        });
    }

    // Handle stacked children
    if (children.stacked.length > 0) {
        let totalStackedHeight = 0;
        let maxStackedWidth = 0;
        children.stacked.forEach((stackedChild) => {
            const stackedSubtreeDims = calculateCompleteSubtreeDimensions(
                stackedChild.brick.uuid,
                allNodes,
                memoMap,
            );
            totalStackedHeight += stackedSubtreeDims.h;
            maxStackedWidth = Math.max(maxStackedWidth, stackedSubtreeDims.w);
        });
        totalHeight += totalStackedHeight;
        totalWidth = Math.max(totalWidth, maxStackedWidth);
    }

    // Handle nested chains under simple bricks
    if (rootNode.brick.type === 'Simple' && children.nested.length > 0) {
        let nestedHeight = 0;
        let nestedWidth = 0;
        children.nested.forEach((nestedChild) => {
            const nestedSubtreeDims = calculateCompleteSubtreeDimensions(
                nestedChild.brick.uuid,
                allNodes,
                memoMap,
            );
            nestedHeight += nestedSubtreeDims.h;
            nestedWidth = Math.max(nestedWidth, nestedSubtreeDims.w);
        });
        totalHeight += nestedHeight;
        totalWidth = Math.max(totalWidth, nestedWidth);
    }

    const result = { w: totalWidth, h: totalHeight };
    memoMap.set(rootNodeId, result);
    return result;
}

export function computeBoundingBoxes(
    allNodes: Map<string, ExtendedTowerNode>,
): Map<string, { w: number; h: number }> {
    const bbMap = new Map<string, { w: number; h: number }>();
    const memoMap = new Map<string, { w: number; h: number }>();

    allNodes.forEach((node, nodeId) => {
        const subtreeDims = calculateCompleteSubtreeDimensions(nodeId, allNodes, memoMap);
        bbMap.set(nodeId, subtreeDims);
    });

    return bbMap;
}

// Enhanced debug function to show the exact problem
export function debugBoundingBoxCalculation(
    allNodes: Map<string, ExtendedTowerNode>,
    bbMap: Map<string, { w: number; h: number }>,
): void {
    if (window.__debugBoundingBoxRan) return;
    window.__debugBoundingBoxRan = true;

    const compoundBricksWithNested = Array.from(allNodes.values()).filter(
        (node) =>
            node.brick instanceof CompoundBrick &&
            getNodeChildren(node.brick.uuid, allNodes).nested.length > 0,
    );

    compoundBricksWithNested.forEach((node) => {
        const nodeId = node.brick.uuid;
        const children = getNodeChildren(nodeId, allNodes);
        const bb = bbMap.get(nodeId);
        const memoMap = new Map<string, { w: number; h: number }>();
        const nestedAreaDims = calculateNestedAreaDimensions(nodeId, allNodes, memoMap);

        const brickLabel = node.brick.name || node.brick.type || 'Unknown';

        if (node.brick.connectionPoints.nested) {
            const nestedPoint = node.brick.connectionPoints.nested;

            const expectedHeight = Math.max(
                node.brick.boundingBox.h,
                nestedPoint.y + nestedAreaDims.h,
            );
            const actualHeight = bb?.h || 0;
        }
    });

    setTimeout(() => {
        window.__debugBoundingBoxRan = false;
    }, 5000);
}
