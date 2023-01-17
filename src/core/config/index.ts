import type { IComponent } from '@/@types/components';

// -- private variables ----------------------------------------------------------------------------

/** Object mapping mounted component names to the  */
const _components: { [id: string]: IComponent } = {};

// -- public functions -----------------------------------------------------------------------------

/**
 * Returns a component module by it's identifier.
 * @param id identifier of the component
 * @returns component module if valid identifier else `null`
 */
export function getComponent(id: string): IComponent | null {
    return id in _components ? _components[id] : null;
}
