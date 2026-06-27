import { v4 as uuidv4 } from 'uuid';

import type {
    TElementClassification,
    TElementKind,
    TElementType,
} from '../../@types/specification';
import type { TData } from '../../@types/data';

import { queryElementSpecification } from '../specification';

import { ElementSyntax } from '../elements/elementSyntax';
import { ElementData, ElementExpression } from '../elements/elementArgument';
import { ElementStatement, ElementBlock } from '../elements/elementInstruction';

// -- private variables ----------------------------------------------------------------------------

/** A non-generic wrapper for class `ElementData`. */
abstract class _ElementDataCover extends ElementData<TData> {}
/** A non-generic wrapper for class `ElementExpression`. */
abstract class _ElementExpressionCover extends ElementExpression<TData> {}

/** Stores the count of element name. */
let _elementNameCountMap: { [name: string]: number } = {};
/** Stores the count of element kind. */
let _elementKindCountMap: { [kind: string]: number } = {};
/** Stores the count of element type. */
let _elementTypeCountMap: { [type: string]: number } = {};
/** Stores the count of element classification. */
let _elementClassificationCountMap: { [group: string]: { [category: string]: number } } = {};

/** Stores an extensive table of element name, kind, type, category, instance, by instance ID. */
let _elementMap: {
    [elementID: string]:
        | {
              instance: _ElementDataCover;
              type: 'Data';
              name: string;
              kind: 'Argument';
              classification: TElementClassification;
          }
        | {
              instance: _ElementExpressionCover;
              type: 'Expression';
              name: string;
              kind: 'Argument';
              classification: TElementClassification;
          }
        | {
              instance: ElementStatement;
              type: 'Statement';
              name: string;
              kind: 'Instruction';
              classification: TElementClassification;
          }
        | {
              instance: ElementBlock;
              type: 'Block';
              name: string;
              kind: 'Instruction';
              classification: TElementClassification;
          };
} = {};

// -- private functions ----------------------------------------------------------------------------

/**
 * Helper function that increases/decreases the count of an element name in the element name count
 * table. While increasing, it adds the entry if not present. While decreasing, it removes the entry
 * if corresponding count is 0.
 * @param type - whether to increase or decrease
 * @param elementName - name of the element
 */
function _adjustElementNameCount(type: 'increase' | 'decrease', elementName: string) {
    if (type === 'increase') {
        if (!(elementName in _elementNameCountMap)) {
            _elementNameCountMap[elementName] = 0;
        }

        _elementNameCountMap[elementName]++;
    } /* if (type === 'decrease') */ else {
        if (elementName in _elementNameCountMap) {
            _elementNameCountMap[elementName]--;

            if (_elementNameCountMap[elementName] < 1) {
                delete _elementNameCountMap[elementName];
            }
        }
    }
}

/**
 * Helper function that increases/decreases the count of an element classification entry in the
 * element classification count table. While increasing, it adds the entry if not present. While
 * decreasing, it removes the entry if corresponding count is 0.
 * @param type - whether to increase or decrease
 * @param group - identifier for the group of categories
 * @param category - identifier for the category
 */
function _adjustElementClassificationCount(
    type: 'increase' | 'decrease',
    group: string,
    category: string,
) {
    if (type === 'increase') {
        if (!(group in _elementClassificationCountMap)) {
            _elementClassificationCountMap[group] = {};
        }

        if (!(category in _elementClassificationCountMap[group])) {
            _elementClassificationCountMap[group][category] = 0;
        }

        _elementClassificationCountMap[group][category]++;
    } /* if (type === 'decrease') */ else {
        if (
            group in _elementClassificationCountMap &&
            category in _elementClassificationCountMap[group]
        ) {
            _elementClassificationCountMap[group][category]--;

            if (_elementClassificationCountMap[group][category] < 1) {
                delete _elementClassificationCountMap[group][category];
            }

            if (Object.keys(_elementClassificationCountMap[group]).length === 0) {
                delete _elementClassificationCountMap[group];
            }
        }
    }
}

/**
 * Helper function that creates a new instance, adds to element table, and updates count tables.
 * @param elementName - name of the element
 * @param instanceID - key for entry in element table
 * @param instance - element instance
 * @param type - type of the element
 * @param classification - group and category of the element
 */
function _addInstance(
    elementName: string,
    instanceID: string,
    instance: ElementSyntax,
    type: TElementType,
    classification: TElementClassification,
): void {
    const kind = type === 'Data' || type === 'Expression' ? 'Argument' : 'Instruction';

    switch (type) {
        case 'Data':
            _elementMap[instanceID] = {
                instance: instance as _ElementDataCover,
                name: elementName,
                type: type as 'Data',
                kind: 'Argument',
                classification,
            };
            break;
        case 'Expression':
            _elementMap[instanceID] = {
                instance: instance as _ElementExpressionCover,
                name: elementName,
                type: type as 'Expression',
                kind: 'Argument',
                classification,
            };
            break;
        case 'Statement':
            _elementMap[instanceID] = {
                instance: instance as ElementStatement,
                name: elementName,
                type: type as 'Statement',
                kind: 'Instruction',
                classification,
            };
            break;
        case 'Block':
            _elementMap[instanceID] = {
                instance: instance as ElementBlock,
                name: elementName,
                type: type as 'Block',
                kind: 'Instruction',
                classification,
            };
            break;
    }

    _adjustElementClassificationCount('increase', classification.group, classification.category);
    _adjustElementNameCount('increase', elementName);
    _elementKindCountMap[kind]++;
    _elementTypeCountMap[type]++;
}

/**
 * Helper that resets the element classification count table.
 */
function _resetElementClassificationCountMap(): void {
    _elementClassificationCountMap = {};
}

/**
 * Helper that resets the element name count table.
 */
function _resetElementNameCountMap(): void {
    _elementNameCountMap = {};
}

/**
 * Helper that resets the element kind count table.
 */
function _resetElementKindCountMap(): void {
    _elementKindCountMap = {
        Argument: 0,
        Instruction: 0,
    };
}

/**
 * Helper that resets the element type count table.
 */
function _resetElementTypeCountMap(): void {
    _elementTypeCountMap = {
        Data: 0,
        Expression: 0,
        Statement: 0,
        Block: 0,
    };
}

// -- public functions -----------------------------------------------------------------------------

/**
 * Creates a new instance, adds to element table, and updates count tables.
 * @param elementName - name of the element
 * @returns - unique instance ID for the element instance
 */
export function addInstance(elementName: string): string {
    const elementSpecification = queryElementSpecification(elementName);

    if (elementSpecification === null) {
        throw Error(`InvalidAccessError: element with name "${elementName}" does not exist`);
    }

    const { classification, label, type, prototype } = elementSpecification;

    let instance: ElementSyntax;

    switch (type) {
        case 'Data':
            instance = (prototype as (name: string, label: string) => _ElementDataCover)(
                elementName,
                label,
            );
            break;
        case 'Expression':
            instance = (prototype as (name: string, label: string) => _ElementExpressionCover)(
                elementName,
                label,
            );
            break;
        case 'Statement':
            instance = (prototype as (name: string, label: string) => ElementStatement)(
                elementName,
                label,
            );
            break;
        case 'Block':
        default:
            instance = (prototype as (name: string, label: string) => ElementBlock)(
                elementName,
                label,
            );
    }

    let instanceID: string;
    do {
        instanceID = uuidv4();
    } while (instanceID in _elementMap);

    _addInstance(elementName, instanceID, instance, type, classification);

    return instanceID;
}

/**
 * Fetches the element instance entry from element table.
 * @param instanceID - instance ID of the element in element table
 * @returns element instance with additional properties
 */
export function getInstance(instanceID: string): {
    name: string;
    kind: TElementKind;
    type: TElementType;
    classification: TElementClassification;
    instance: ElementSyntax;
} | null {
    return instanceID in _elementMap ? { ..._elementMap[instanceID] } : null;
}

/**
 * Removes the element entry corresponding to the instance ID and updates count tables.
 * @param instanceID - instance ID of the element in element table
 */
export function removeInstance(instanceID: string): void {
    if (!(instanceID in _elementMap)) {
        return;
    }

    const { name, kind, type, classification } = _elementMap[instanceID];
    _adjustElementNameCount('decrease', name);
    _adjustElementClassificationCount('decrease', classification.group, classification.category);
    _elementKindCountMap[kind]--;
    _elementTypeCountMap[type]--;
    delete _elementMap[instanceID];
}

/**
 * Returns the number of element instances of an element classification exists in element table.
 * @param group - group of the element
 * @param category - category of the element
 * @returns count of the element instances for the element category
 */
export function getClassificationCount(group: string, category: string): number {
    return group in _elementClassificationCountMap &&
        category in _elementClassificationCountMap[group]
        ? _elementClassificationCountMap[group][category]
        : 0;
}

/**
 * Generates a table of element instance counts by element group and category.
 * @returns an object with key-value pairs of element group and key-value pairs of element category
 * and instance count
 */
export function getClassificationCountAll(): {
    [group: string]: {
        [category: string]: number;
    };
} {
    return JSON.parse(JSON.stringify(_elementClassificationCountMap));
}

/**
 * Returns the number of element instances of an element name exists in element table.
 * @param name - name of the element
 * @returns count of the element instances for the element name
 */
export function getNameCount(name: string): number {
    return name in _elementNameCountMap ? _elementNameCountMap[name] : 0;
}

/**
 * Generates a table of element instance counts by element name.
 * @returns an object with key-value pairs of element name and instance count
 */
export function getNameCountAll(): { [name: string]: number } {
    return JSON.parse(JSON.stringify(_elementNameCountMap));
}

/**
 * Returns the number of element instances of an element kind exists in element table.
 * @param kind - kind of the element
 * @returns count of the element instances for the element kind
 */
export function getKindCount(kind: TElementKind): number {
    return _elementKindCountMap[kind];
}

/**
 * Generates a table of element instance counts by element kind.
 * @returns an object with key-value pairs of element kind and instance count
 */
export function getKindCountAll(): { [kind: string]: number } {
    return JSON.parse(JSON.stringify(_elementKindCountMap));
}

/**
 * Returns the number of element instances of an element type exists in element table.
 * @param type - type of the element
 * @returns count of the element instances for the element type
 */
export function getTypeCount(type: TElementType): number {
    return _elementTypeCountMap[type];
}

/**
 * Generates a table of element instance counts by element type.
 * @returns an object with key-value pairs of element type and instance count
 */
export function getTypeCountAll(): { [type: string]: number } {
    return JSON.parse(JSON.stringify(_elementTypeCountMap));
}

/**
 * Resets all the count tables and element map.
 */
export function resetWarehouse(): void {
    _elementMap = {};
    _resetElementClassificationCountMap();
    _resetElementNameCountMap();
    _resetElementKindCountMap();
    _resetElementTypeCountMap();
}

resetWarehouse();
