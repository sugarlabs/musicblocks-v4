import { run } from '.';

import { generateFromSnapshot, generateSnapshot } from '../../syntax/tree';
import { ScopeStack } from '../../execution/scope';

import { registerElementSpecificationEntries } from '../../syntax/specification';
import elementSpecification from '../../library';

// -------------------------------------------------------------------------------------------------

registerElementSpecificationEntries(elementSpecification);
const scopeStack = new ScopeStack();

describe('Interpreter', () => {
    test('run a process and verify', () => {
        /*
        fibonacci sequence
        
        a = 0
        b = 1
        repeat(10)
            print(c)
            c = plus(a, b)
            a = b
            b = c
        
        expect 1, 1, 2, 3, 5, 8, 13, 21, 34, 55
         */

        generateFromSnapshot({
            process: [
                {
                    elementName: 'process',
                    argMap: null,
                    scope: [
                        {
                            elementName: 'box-number',
                            argMap: {
                                name: {
                                    elementName: 'value-string',
                                    value: 'a',
                                },
                                value: {
                                    elementName: 'value-number',
                                    value: '0',
                                },
                            },
                        },
                        {
                            elementName: 'box-number',
                            argMap: {
                                name: {
                                    elementName: 'value-string',
                                    value: 'b',
                                },
                                value: {
                                    elementName: 'value-number',
                                    value: '1',
                                },
                            },
                        },
                        {
                            elementName: 'box-number',
                            argMap: {
                                name: {
                                    elementName: 'value-string',
                                    value: 'c',
                                },
                                value: {
                                    elementName: 'value-number',
                                    value: '1',
                                },
                            },
                        },
                        {
                            elementName: 'repeat',
                            argMap: {
                                times: {
                                    elementName: 'value-number',
                                    value: '10',
                                },
                            },
                            scope: [
                                {
                                    elementName: 'print',
                                    argMap: {
                                        value: {
                                            elementName: 'boxidentifier-number',
                                            value: 'c',
                                        },
                                    },
                                },
                                {
                                    elementName: 'box-number',
                                    argMap: {
                                        name: {
                                            elementName: 'value-string',
                                            value: 'c',
                                        },
                                        value: {
                                            elementName: 'operator-math-plus',
                                            argMap: {
                                                operand1: {
                                                    elementName: 'boxidentifier-number',
                                                    value: 'a',
                                                },
                                                operand2: {
                                                    elementName: 'boxidentifier-number',
                                                    value: 'b',
                                                },
                                            },
                                        },
                                    },
                                },
                                {
                                    elementName: 'box-number',
                                    argMap: {
                                        name: {
                                            elementName: 'value-string',
                                            value: 'a',
                                        },
                                        value: {
                                            elementName: 'boxidentifier-number',
                                            value: 'b',
                                        },
                                    },
                                },
                                {
                                    elementName: 'box-number',
                                    argMap: {
                                        name: {
                                            elementName: 'value-string',
                                            value: 'b',
                                        },
                                        value: {
                                            elementName: 'boxidentifier-number',
                                            value: 'c',
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
            routine: [],
            crumbs: [],
        });
        const snapshot = generateSnapshot();

        const node = snapshot.process[0];
        run(node.nodeID, {
            context: scopeStack.getContext('programming'),
            symbolTable: scopeStack.getSymbolTable(),
        });
    });
});
