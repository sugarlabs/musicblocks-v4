/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
    ITreeSnapshotInput,
    generateFromSnapshot,
    generateSnapshot,
    registerElementSpecificationEntries,
    resetSyntaxTree,
    getSpecificationSnapshot,
} from '@sugarlabs/musicblocks-v4-lib';

import {
    addInstance,
    getInstance,
    removeInstance,
} from '@sugarlabs/musicblocks-v4-lib/syntax/warehouse/warehouse';

import { librarySpecification } from '@sugarlabs/musicblocks-v4-lib';
registerElementSpecificationEntries(librarySpecification);

// -- public functions -----------------------------------------------------------------------------

/**
 * Generates the API for the loaded specification.
 * @returns list of valid instruction signatures
 */
export function generateAPI(): string {
    const snapshot = getSpecificationSnapshot();
    const api: string[] = [];

    Object.entries(snapshot)
        .filter(
            ([_, specification]) =>
                specification.type === 'Statement' &&
                ['Graphics', 'Pen'].includes(specification.category),
        )
        .forEach(([elementName, _]) => {
            const instanceID = addInstance(elementName);
            const instance = getInstance(instanceID)!.instance;
            const args: [string, string][] = instance.argLabels.map((arg) => [
                arg,
                instance.getArgType(arg).join('|'),
            ]);
            removeInstance(instanceID);

            api.push(`${elementName} ${args.map(([name, types]) => `${name}:${types}`).join(' ')}`);
        });

    return api.join('\n');
}

/**
 * Validates code, transpiles it, and generates the Syntax Tree in the Programming Engine.
 * @param code editor's code
 * @returns a `Promise` that returns whether the process was successful
 */
export function buildProgram(code: string): Promise<boolean> {
    function checkValidity(): boolean {
        /*
         * dummy logic
         */
        const lines = code.split('\n');
        for (const line of lines) {
            const units = line.split(' ');
            if (
                !(
                    units.length === 1 ||
                    units.length === 2 ||
                    units.length === 3 ||
                    (units.length === 4 && units[0] === '' && units[1] === '')
                )
            ) {
                return false;
            }
        }

        return true;
    }

    function transpile(): void {
        // dummy program build (for debugging)
        // import('./dummy');

        const snapshot: ITreeSnapshotInput = { process: [], routine: [], crumbs: [[]] };
        const crumb = snapshot.crumbs[0];

        const addInstruction = (units: string[]) => {
            const elementName = units[0];
            const argMap = {};

            let args: [string, string][] = units
                .slice(1)
                .map((unit) => unit.split(':') as [string, string]);
            args.forEach(([param, value]) => {
                // @ts-ignore
                argMap[param] = {
                    elementName: 'value-number',
                    value,
                };
            });

            crumb.push({
                elementName,
                argMap,
            });
        };

        for (const line of code.split('\n')) {
            const units = line.split(' ');
            addInstruction(units);
        }

        generateFromSnapshot(snapshot);
    }

    return new Promise((resolve) => {
        if (checkValidity() === false) {
            resolve(false);
        } else {
            const snapshot = generateSnapshot();
            try {
                transpile();
                resolve(true);
            } catch (e) {
                console.log(e);
                generateFromSnapshot(snapshot);
                resolve(false);
            }
        }
    });
}

/**
 * Resets the program — generates an empty Syntax Tree.
 */
export function resetProgram(): void {
    resetSyntaxTree();
}
