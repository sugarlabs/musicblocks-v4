import type { TComponentId } from '@/@types/components';

// -------------------------------------------------------------------------------------------------

/**
 * Serializes components by dependency ordering using Topological Sorting.
 * @param components list of objects of component identifier and dependent component identifiers
 * @returns component identifiers in serialized order
 */
export function serializeComponentDependencies(
    components: { id: TComponentId; dependencies: TComponentId[] }[],
): TComponentId[] {
    const length = components.length;

    /**
     * Generates a Directed Acyclic Graph (DAG) of the component indices.
     * @returns a `nxn` matrix representing the DAG in adjacent list form
     *
     * @description
     * Consider there are five components (`a`, `b`, `c`, `d`, `e`). `b` is child of `a`, `c` is
     * child of `b`, `e` is child of `b` and `d`.
     * The DAG will be:
     * a <-- b <-- c
     *       ^
     *       |
     * d <-- e
     * The DAG matrix returned will be:
     *   ____a_____b_____c_____d_____e____
     * a | false false false false false |
     * b |  true false false false false |
     * c | false  true false false false |
     * d | false false false false false |
     * e | false  true false  true false |
     *   ---------------------------------
     * A cell (`row`, `col`) represents if component with index `row` is a child of component with
     * index `col`.
     */
    const createDAG = () => {
        const DAG = new Array<boolean[]>(length);

        for (let i = 0; i < length; i++) {
            const rowComponent = components[i];
            DAG[i] = new Array<boolean>(length);
            DAG[i].fill(false);

            for (let j = 0; j < length; j++) {
                const colComponent = components[j];

                if (rowComponent.dependencies.includes(colComponent.id)) {
                    DAG[i][j] = true;
                }
            }
        }

        return DAG;
    };

    const DAG = createDAG();

    /**
     * Serializes the generated DAG using Topological Sorting such that child component indices
     * appear after their parent component indices in the ordering
     * @returns a list of serialized indices of the DAG
     *
     * @description
     * For the example above (function `createDAG` description), the result will be
     * `[0, 3, 1, 2, 4]` representing component order [`a`, `d`, `b`, `c`, `e`].
     */
    const serializeDAG = () => {
        let visited: number[] = [];
        let visiting: number[] = [];
        let unvisited: number[] = components.map((_, i) => i);

        while (unvisited.length > 0) {
            // find nodes with no parents
            for (let i = 0; i < length; i++) {
                let hasParents = false;

                for (let j = 0; j < length; j++) {
                    if (DAG[i][j] === true) {
                        hasParents = true;
                        break;
                    }
                }

                // if node has no parents and node wasn't visited
                if (!hasParents && !visited.includes(i)) {
                    // add node to visitng list
                    visiting.push(i);
                    // remove node from unvisited list
                    unvisited.splice(
                        unvisited.findIndex((index) => index === i),
                        1,
                    );
                }
            }

            // edge case for cyclic graph (or subgraph)
            if (visiting.length === 0) {
                throw Error('Invalid Config: dependency resolution results in a cyclic graph');
            }

            // for visiting nodes in order
            for (const index of visiting) {
                // add node to visited list
                visited.push(index);

                // remove all edges (in DAG) to node
                for (let j = 0; j < length; j++) {
                    DAG[j][index] = false;
                }
            }

            // clear visiting list
            visiting = [];
        }

        return visited;
    };

    const serializedIndices = serializeDAG();

    return serializedIndices.map((i) => components[i].id);
}

// -------------------------------------------------------------------------------------------------

/*
 * dummy config to debug valid topological sorting
 *   a <-- b <-- c
 *         ^
 *         |
 *   d <-- e
 */

// serializeComponentDependencies([
//     // @ts-ignore
//     { id: 'a', dependencies: [] },
//     // @ts-ignore
//     { id: 'b', dependencies: ['a'] },
//     // @ts-ignore
//     { id: 'c', dependencies: ['b'] },
//     // @ts-ignore
//     { id: 'd', dependencies: [] },
//     // @ts-ignore
//     { id: 'e', dependencies: ['b', 'd'] },
// ]).forEach((componentId) => console.log(componentId));

/*
 * dummy config to debug invalid (cycle in `b`, `c`, `e`) topological sorting
 *   a <-- b <-- c
 *         |     ^
 *         v     |
 *   d <-- e ----
 */

// serializeComponentDependencies([
//     // @ts-ignore
//     { id: 'a', dependencies: [] },
//     // @ts-ignore
//     { id: 'b', dependencies: ['e'] },
//     // @ts-ignore
//     { id: 'c', dependencies: ['b'] },
//     // @ts-ignore
//     { id: 'd', dependencies: [] },
//     // @ts-ignore
//     { id: 'e', dependencies: ['d', 'd'] },
// ]).forEach((componentId) => console.log(componentId));
