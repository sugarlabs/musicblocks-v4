import type { ExportedProject, ExportedTower, ExportedNode } from '../@types/import-export.types';
import type { TowerState } from '../@types/workspace.types';
import type { TowerNode } from '../@types/tower.types';

/**
 * Serializes the current workspace towers into a flattened, JSON-serializable structure.
 * This function traverses the cyclic node graph and extracts only the downward pointers,
 * eliminating circular references so `JSON.stringify()` will not crash.
 *
 * @param towers The live towers record from the workspace Zustand state.
 * @returns An `ExportedProject` ready to be converted to JSON.
 */
export function exportWorkspace(towers: Record<string, TowerState>): ExportedProject {
    const exportedTowers: ExportedTower[] = [];
    const nodes: Record<string, ExportedNode> = {};

    for (const tower of Object.values(towers)) {
        exportedTowers.push({
            id: tower.id,
            position: { ...tower.position },
            rootNodeId: tower.root.model.id,
        });

        // Traverse the tree to populate nodes.
        // We use a stack for a depth-first traversal of the brick hierarchy.
        const stack: TowerNode[] = [tower.root];

        while (stack.length > 0) {
            const current = stack.pop()!;
            // Skip if we already serialized this node (guards against infinite loops if the graph is malformed)
            if (nodes[current.model.id]) {
                continue;
            }

            const model = current.model;

            // Base config that applies to all bricks, matching the constructor signatures
            const modelConfig: Record<string, unknown> = {
                id: model.id,
                colorsDefault: { ...model.colorsDefault },
                tooltipText: model.tooltipText,
                scaleLevel: model.scaleLevel,
                // Assigning the widget directly. It will be deeply serialized by JSON.stringify later.
                widget: model.widget,
            };

            const exportedNode: ExportedNode = {
                id: model.id,
                kind: model.kind,
                modelConfig: modelConfig as ExportedNode['modelConfig'],
                args: [],
            };

            // Handle type-specific properties
            if (model.kind === 'expression' || model.kind === 'statement') {
                modelConfig.params = [...model.params];
            }
            if (model.kind === 'statement') {
                modelConfig.hasNesting = model.hasNesting;
                modelConfig.isNestingFolded = model.isNestingFolded;
            }

            // Extract structural pointers for connections and queue children for traversal
            if (current.kind === 'expression' || current.kind === 'statement') {
                exportedNode.args = current.args.map((arg) => {
                    if (arg) {
                        stack.push(arg);
                        return arg.model.id;
                    }
                    return null;
                });
            }

            if (current.kind === 'statement') {
                exportedNode.next = current.next ? current.next.model.id : null;
                if (current.next) {
                    stack.push(current.next);
                }

                if (current.model.hasNesting) {
                    exportedNode.nestedNext = current.nestedNext
                        ? current.nestedNext.model.id
                        : null;
                    if (current.nestedNext) {
                        stack.push(current.nestedNext);
                    }
                }
            }

            nodes[model.id] = exportedNode;
        }
    }

    return {
        towers: exportedTowers,
        nodes,
    };
}
