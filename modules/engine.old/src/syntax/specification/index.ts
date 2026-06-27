import { hasContext, registerContext } from '../../execution/scope';

// -- types ----------------------------------------------------------------------------------------

import type { TDataName } from '../../@types/data';
import type {
    IElementSpecificationData,
    IElementSpecificationExpression,
    IElementSpecificationStatement,
    IElementSpecificationBlock,
    IElementSpecification,
    IElementSpecificationEntryData,
    IElementSpecificationEntryExpression,
    IElementSpecificationEntryStatement,
    IElementSpecificationEntryBlock,
    IElementSpecificationSnapshot,
    IElementSpecificationEntries,
} from '../../@types/specification';

// -- private variables ----------------------------------------------------------------------------

/** Stores the specifications for each element as a key-value pair of name: specification. */
let _elementSpecification: {
    [identifier: string]:
        | IElementSpecificationData
        | IElementSpecificationExpression
        | IElementSpecificationStatement
        | IElementSpecificationBlock;
} = {};
/**
 * Stores the snapshot (similar to snapshot, except that prototype is replaced with prototype name —
 * class name of the syntax element or the prototype) of the specifications for each element as a
 * key-value pair of name: specification.
 */
let _elementSpecificationSnapshot: {
    [identifier: string]: IElementSpecificationSnapshot;
} = {};

// -- public functions -----------------------------------------------------------------------------

/**
 * Registers a syntax element specification from a given specification entry data.
 * @param name name of the syntax element
 * @param specification specification entry data
 * @returns `false` if element name already exists, else `true`
 */
export function registerElementSpecificationEntry(
    group: string,
    name: string,
    specification:
        | IElementSpecificationEntryData
        | IElementSpecificationEntryExpression
        | IElementSpecificationEntryStatement
        | IElementSpecificationEntryBlock,
): boolean {
    if (name in _elementSpecification) return false;

    const { category, label, type, prototype } = specification;

    const specificationTableEntry: IElementSpecification = {
        classification: { group, category },
        label,
        type,
        // @ts-ignore
        prototype: (name: string, label: string) => new prototype(name, label),
    };

    const specificationSnapshotTableEntry: IElementSpecificationSnapshot = {
        classification: { group, category },
        label,
        type,
        prototypeName: prototype.name,
    };

    Object.entries(specification).forEach(([key, value]) => {
        if (!['label', 'type', 'category', 'prototype'].includes(key)) {
            // @ts-ignore
            specificationTableEntry[key] = value;
            // @ts-ignore
            specificationSnapshotTableEntry[key] = value;
        }
    });

    _elementSpecification[name] = specificationTableEntry as unknown as
        | IElementSpecificationData
        | IElementSpecificationExpression
        | IElementSpecificationStatement
        | IElementSpecificationBlock;

    _elementSpecificationSnapshot[name] = specificationSnapshotTableEntry;

    return name in _elementSpecification;
}

/**
 * Registers a syntax element specification from a given specification entry table.
 * @param specification specification entry table object with key-value pairs of element name and
 *  corresponding specification entry data
 * @returns a list of boolean , `false` if element name already exists else `true`
 */
export function registerElementSpecificationEntries(specification: IElementSpecificationEntries): {
    [group: string]: { [identifier: string]: boolean };
} {
    const registerStatus: { [group: string]: { [identifier: string]: boolean } } = {};

    Object.entries(specification).forEach(([group, { entries, context }]) => {
        const status: { [identifier: string]: boolean } = {};
        Object.entries(entries).forEach(
            ([identifier, specification]) =>
                (status[identifier] = registerElementSpecificationEntry(
                    group,
                    identifier,
                    specification,
                )),
        );
        registerStatus[group] = status;

        if (context) registerContext(group, context);
        else if (!hasContext(group)) registerContext(group, {});
    });

    console.log(registerStatus);

    return registerStatus;
}

/**
 * Removes specification for a syntax element.
 * @param name name of the syntax element
 * @returns `true` if element is successfully removed, else `false` if element doesn't exist already
 */
export function removeElementSpecificationEntry(name: string): boolean {
    if (name in _elementSpecification) {
        delete _elementSpecification[name];
        delete _elementSpecificationSnapshot[name];
        return true;
    } else {
        return false;
    }
}

/**
 * Removes specification for a list of syntax element.
 * @param names list of names of the syntax element
 * @returns list of boolean, `true` if element is successfully removed, else `false`
 */
export function removeElementSpecificationEntries(names: string[]): boolean[] {
    const removeStatus: boolean[] = [];
    names.forEach((name) => removeStatus.push(removeElementSpecificationEntry(name)));
    return removeStatus;
}

/**
 * Returns the element specification for a syntax element.
 * @param name name of the syntax element
 * @returns element specification if exists, else `null`
 */
export function queryElementSpecification(
    name: string,
):
    | IElementSpecificationData
    | IElementSpecificationExpression
    | IElementSpecificationStatement
    | IElementSpecificationBlock
    | null {
    return name in _elementSpecification ? { ..._elementSpecification[name] } : null;
}

/**
 * Returns the classification (logical grouping) of available syntax elements.
 * @returns a map of syntax element classification over groups and further into categories
 */
export function getElementClassifications(): { [group: string]: string[] } {
    const classifications: { [group: string]: Set<string> } = {};
    Object.entries(_elementSpecification).forEach(
        ([
            _,
            {
                classification: { group, category },
            },
        ]) => {
            if (!(group in classifications)) {
                classifications[group] = new Set<string>();
            }

            classifications[group].add(category);
        },
    );

    return Object.fromEntries(
        Object.entries(classifications).map(([group, category]) => [group, [...category].sort()]),
    );
}

/**
 * Returns the names of available syntax elements.
 * @returns a list of syntax element names.
 */
export function getElementNames(): string[] {
    return Object.keys(_elementSpecification);
}

/**
 * Resets the element specification to factory list.
 */
export function resetElementSpecificationTable(): void {
    _elementSpecification = {};
    _elementSpecificationSnapshot = {};
}

/**
 * Returns the snapshot of the element specification table.
 * @returns snapshot entry table object with key-value pairs of element name and corresponding
 * element specification snapshot
 */
export function getSpecificationSnapshot(): {
    [name: string]: IElementSpecificationSnapshot;
} {
    return _elementSpecificationSnapshot;
}

/**
 * Check if `value` can be assigned to element `name`.
 * @param name name of the syntax element (expecting a data element)
 * @param value value to check
 * @returns whether value can be assigned
 */
export function checkValueAssignment(name: string, value: string): boolean {
    if ('values' in _elementSpecification[name]) {
        const values = (_elementSpecification[name] as IElementSpecificationData).values!;

        if (values instanceof Array) {
            return values.includes(value);
        } else {
            let typeDeepInfer: TDataName;
            if (['true', 'false'].includes(value)) {
                typeDeepInfer = 'boolean';
            } else if (!isNaN(Number(value))) {
                typeDeepInfer = 'number';
            } else {
                typeDeepInfer = 'string';
            }

            return (
                values.types.includes(typeDeepInfer as TDataName) || values.types.includes('string')
            );
        }
    }
    return true;
}

resetElementSpecificationTable();
