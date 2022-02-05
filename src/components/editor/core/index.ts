/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
    ITreeSnapshotInput,
    generateFromSnapshot,
    generateSnapshot,
    getInstance,
    getNode,
    registerElementSpecificationEntries,
    resetSyntaxTree,
} from '@sugarlabs/musicblocks-v4-lib';

import { librarySpecification } from '@sugarlabs/musicblocks-v4-lib';
registerElementSpecificationEntries(librarySpecification);

// -- public functions -----------------------------------------------------------------------------

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
                !(units.length === 2 || (units.length === 4 && units[0] === '' && units[1] === ''))
            ) {
                return false;
            }
        }

        return true;
    }

    function transpile(): void {
        // dummy program build (for debugging)
        // import('./dummy');

        const snapshotInput: ITreeSnapshotInput = { process: [], routine: [], crumbs: [[]] };
        const crumb = snapshotInput.crumbs[0];

        const addInstruction = (units: string[], index: number) => {
            const elementName = units[0];
            const argMap = {};

            let args: [string, string][] = units
                .slice(1)
                .map((unit) => unit.split(':') as [string, string]);
            args.forEach(([param, _]) => {
                // @ts-ignore
                argMap[param] = {
                    elementName: 'value-number',
                };
            });

            crumb.push({
                elementName,
                argMap,
            });

            return (snapshot: ITreeSnapshotInput) => {
                args.forEach(([param, value]) => {
                    getInstance(
                        // @ts-ignore
                        getNode(snapshot.crumbs[0][index]['argMap'][param].nodeID)!.instanceID,
                    )!.instance.updateLabel(value);
                });
            };
        };

        const callbacks = [];
        for (const [i, line] of code.split('\n').entries()) {
            const units = line.split(' ');
            callbacks.push(addInstruction(units, i));
        }

        generateFromSnapshot(snapshotInput);
        const snapshot = generateSnapshot();

        callbacks.forEach((callback) => callback.call(null, snapshot));
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
