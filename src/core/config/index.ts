import type { IComponent, TComponentId, TFeatureFlag } from '@/@types/components';
import type { IElementSpecification } from '@sugarlabs/musicblocks-v4-lib';

import { default as componentMap } from '@/components';

import {
    registerElementSpecificationEntries,
    librarySpecification,
} from '@sugarlabs/musicblocks-v4-lib';

// -- private variables ----------------------------------------------------------------------------

/** Stores key-value pairs of component identifier and component module. */
const _components: Partial<Record<TComponentId, IComponent>> = {};

// -- private functions ----------------------------------------------------------------------------

/**
 * Imports a component module.
 * @param componentId component identifier
 * @param path path to the module relative to `src/components`
 * @returns a Promise to the component's module
 */
async function _importComponent(componentId: TComponentId, path: string): Promise<IComponent> {
    _components[componentId] = await import(`../../components/${path}/index.ts`);
    return _components[componentId]!;
}

/**
 * Mounts a component module.
 * @param componentId component identifier
 * @param flags feature flags
 */
async function _mountComponent(componentId: TComponentId, flags?: TFeatureFlag): Promise<void> {
    const component = _components[componentId]!;
    await component.mount(flags);
}

/**
 * Initializes a component module.
 * @param componentId component identifier
 */
async function _setupComponent(componentId: TComponentId): Promise<void> {
    const component = _components[componentId]!;
    await component.setup();
}

// -- public functions -----------------------------------------------------------------------------

/**
 * Returns a component module by it's identifier.
 * @param componentId component identifier
 * @returns component module if valid identifier else `null`
 */
export function getComponent(componentId: TComponentId): IComponent | null {
    return componentId in _components ? _components[componentId]! : null;
}

/**
 * Imports a list of component modules asynchronously.
 * @param componentIds list of component identifiers
 * @param callback callback function to call after succesful import of each component's module
 * @returns a Promise to the component module map
 */
export async function importComponents(
    componentIds: TComponentId[],
    callback: (componentId: TComponentId) => unknown,
): Promise<Partial<Record<TComponentId, IComponent>>> {
    Object.fromEntries(
        await Promise.all(
            componentIds
                .map((id) => [id, componentMap[id].path] as [TComponentId, string])
                .map(([id, path]) =>
                    _importComponent(id, path).then((component) => {
                        callback(id);
                        return [id, component];
                    }),
                ),
        ),
    );

    return _components;
}

/**
 * Mounts a list of component modules synchronously.
 * @param entries list of tuples of component identifiers and feature flags
 * @param callback callback function to call after succesful mounting of each component
 */
export async function mountComponents(
    entries: [TComponentId, TFeatureFlag | undefined][],
    callback: (componentId: TComponentId) => unknown,
): Promise<void> {
    return new Promise((resolve) => {
        const iterator = entries.entries();

        async function _mountHelper(
            iteratorResult: IteratorResult<
                [number, [TComponentId, TFeatureFlag | undefined]],
                unknown
            >,
        ): Promise<void> {
            if (iteratorResult.done) return;

            const [_, [componentId, flags]] = iteratorResult.value;
            await _mountComponent(componentId, flags);
            callback(componentId);

            return _mountHelper(iterator.next());
        }

        _mountHelper(iterator.next()).then(() => requestAnimationFrame(() => resolve()));
    });
}

/**
 * Initializes a list of component modules synchronously.
 * @param componentIds list of component identifiers
 * @param callback callback function to call after succesful initialization of each component
 */
export async function setupComponents(
    componentIds: TComponentId[],
    callback: (componentId: TComponentId) => unknown,
): Promise<void> {
    return new Promise((resolve) => {
        const iterator = componentIds.entries();

        async function _setupHelper(
            iteratorResult: IteratorResult<[number, TComponentId], unknown>,
        ): Promise<void> {
            if (iteratorResult.done) return;

            const [_, componentId] = iteratorResult.value;
            await _setupComponent(componentId);
            callback(componentId);

            return _setupHelper(iterator.next());
        }

        _setupHelper(iterator.next()).then(() => requestAnimationFrame(() => resolve()));
    });
}

/**
 * Registers syntax elements in the programming engine.
 * @param entries list of objects of component identifiers and corresponding syntax element filters
 */
export function registerElements(
    entries: {
        /** Component identifier. */
        id: TComponentId;
        /** List of syntax elements to register, or register all if `true`. */
        filter: string[] | true | undefined;
    }[],
) {
    registerElementSpecificationEntries(librarySpecification);

    entries
        .filter(({ filter }) => filter !== undefined)
        .map(({ id, filter }) => {
            if (filter === true) {
                return { id, specification: _components[id]!.definition.elements };
            }

            return {
                id,
                specification: Object.fromEntries(
                    Object.entries(_components[id]!.definition.elements!).filter(([elementName]) =>
                        filter?.includes(elementName),
                    ),
                ),
            };
        })
        .map(
            ({ specification }) =>
                specification as { [elementName: string]: IElementSpecification } | undefined,
        )
        .filter((specification) => specification !== undefined)
        .forEach((specification) => registerElementSpecificationEntries(specification!));
}

export { serializeComponentDependencies } from './utils';
