import { IConfig, IComponent } from '../@types';

import {
    registerElementSpecificationEntries,
    librarySpecification,
} from '@sugarlabs/musicblocks-v4-lib';

import { loadStrings } from '@/i18n';
// -- private variables ----------------------------------------------------------------------------

/** File name of the selected config file. */
const _configFile = 'base';

/** Object mapping mounted component names to the  */
const _components: { [name: string]: IComponent } = {};

// -- private functions ----------------------------------------------------------------------------

/**
 * Serializes components by dependency ordering using Topological Sorting.
 * @param config loaded config
 * @returns config with serialized components
 */
export function _serializeComponentDependencies(config: IConfig): IConfig {
    const components = config.components;

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

            if (!('parents' in rowComponent)) continue;

            for (let j = 0; j < length; j++) {
                const colComponent = components[j];

                if (rowComponent.parents!.includes(colComponent.name)) {
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

    return { ...config, components: serializedIndices.map((i) => components[i]) };
}

// -- public functions -----------------------------------------------------------------------------

/**
 * Returns a component module by it's name.
 * @param name name of the component
 * @returns component module if valid name else `null`
 */
export function getComponent(name: string): IComponent | null {
    return name in _components ? _components[name] : null;
}

// -------------------------------------------------------------------------------------------------

// load the config file and setup
(async () => {
    let config: IConfig;

    /*
     * load the config file
     * ====================================================
     */

    try {
        if (process.env['NODE_ENV'] === 'development') {
            const configModule = await import(`./${_configFile}-dev.jsonc`);
            config = configModule.default;
        } else {
            throw Error();
        }
    } catch (e) {
        const configModule = await import(`./${_configFile}.jsonc`);
        config = configModule.default;
    }

    /*
     * setup i18n language
     * ====================================================
     */

    await loadStrings('lang' in config.env ? config.env.lang : undefined);

    /*
     * load and mount components
     * ====================================================
     */

    let importPromises: Promise<[string, IComponent]>[] = [];

    /*
     * dummy config to debug valid topological sorting
     *   a <-- b <-- c
     *         ^
     *         |
     *   d <-- e
     */

    // _serializeComponentDependencies({
    //     components: [
    //         { name: 'a' },
    //         { name: 'b', parents: ['a'] },
    //         { name: 'c', parents: ['b'] },
    //         { name: 'd' },
    //         { name: 'e', parents: ['b', 'd'] },
    //     ],
    // }).components.forEach((component) => console.log(component.name));

    /*
     * dummy config to debug invalid (cycle in `b`, `c`, `e`) topological sorting
     *   a <-- b <-- c
     *         |     ^
     *         v     |
     *   d <-- e ----
     */

    // _serializeComponentDependencies({
    //     components: [
    //         { name: 'a' },
    //         { name: 'b', parents: ['e'] },
    //         { name: 'c', parents: ['b'] },
    //         { name: 'd' },
    //         { name: 'e', parents: ['d', 'c'] },
    //     ],
    // }).components.forEach((component) => console.log(component.name));

    const configEntriesSerialized = _serializeComponentDependencies(config);

    // for each component entry in the config file
    configEntriesSerialized.components.forEach((componentEntry) => {
        // import the component module using the component name in the component entry
        importPromises.push(
            // ignore Markdown files
            import(
                /* webpackExclude: /\.md$|editor-next/ */
                `../components/${componentEntry.name}`
            ).then((component: IComponent) => {
                if ('elements' in componentEntry) {
                    // register the syntax elements specified in the component entry from the
                    // component module's specification
                    if (typeof componentEntry.elements === 'boolean') {
                        if (componentEntry.elements) {
                            registerElementSpecificationEntries(component.specification!);
                        }
                    } else {
                        registerElementSpecificationEntries(
                            Object.fromEntries(
                                (componentEntry.elements as string[])
                                    .map((elementName) => [
                                        elementName,
                                        component.specification![elementName],
                                    ])
                                    .filter(([_, specification]) => specification !== undefined),
                            ),
                        );
                    }
                }

                return new Promise((resolve) => {
                    // mount the component
                    component
                        .mount('flags' in componentEntry ? componentEntry.flags : undefined)
                        .then(() => resolve([componentEntry.name, component]));
                });
            }),
        );
    });

    Promise.all(importPromises).then((components) => {
        registerElementSpecificationEntries(librarySpecification);

        const iterator = components.entries();

        const setupComponent = (
            iteratorResult: IteratorResult<[number, [string, IComponent]], unknown>,
        ) => {
            if (iteratorResult.done) return;

            const [_, [name, component]] = iteratorResult.value;
            _components[name] = component;
            // initialize the components after they are mounted
            component.setup().then(() => setupComponent(iterator.next()));
        };

        setupComponent(iterator.next());
    });
})();
