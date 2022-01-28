/* eslint-disable @typescript-eslint/ban-ts-comment */

import { mount } from './painter';

const root = document.getElementById('root')!;

const artboardContainer = document.createElement('div');
artboardContainer.id = 'artboards';
root.appendChild(artboardContainer);
mount(artboardContainer);

// -------------------------------------------------------------------------------------------------

import {
    generateFromSnapshot,
    generateSnapshot,
    getCrumbs,
    getInstance,
    getNode,
    registerElementSpecificationEntries,
    registerElementSpecificationEntry,
    run,
} from '@sugarlabs/musicblocks-v4-lib';

import { librarySpecification } from '@sugarlabs/musicblocks-v4-lib';
import painterSpecification from './painter';

registerElementSpecificationEntries(painterSpecification);
registerElementSpecificationEntry('value-number', librarySpecification['value-number']);
registerElementSpecificationEntry('repeat', librarySpecification['repeat']);

window.addEventListener('runevent', () => {
    generateFromSnapshot({
        process: [],
        routine: [],
        crumbs: [
            [
                {
                    elementName: 'set-color',
                    argMap: {
                        value: {
                            elementName: 'value-number',
                        },
                    },
                },
                {
                    elementName: 'set-thickness',
                    argMap: {
                        value: {
                            elementName: 'value-number',
                        },
                    },
                },
                {
                    elementName: 'repeat',
                    argMap: {
                        times: {
                            elementName: 'value-number',
                        },
                    },
                    scope: [
                        {
                            elementName: 'move-forward',
                            argMap: {
                                steps: {
                                    elementName: 'value-number',
                                },
                            },
                        },
                        {
                            elementName: 'turn-right',
                            argMap: {
                                angle: {
                                    elementName: 'value-number',
                                },
                            },
                        },
                    ],
                },
                {
                    elementName: 'set-color',
                    argMap: {
                        value: {
                            elementName: 'value-number',
                        },
                    },
                },
                {
                    elementName: 'set-thickness',
                    argMap: {
                        value: {
                            elementName: 'value-number',
                        },
                    },
                },
                {
                    elementName: 'repeat',
                    argMap: {
                        times: {
                            elementName: 'value-number',
                        },
                    },
                    scope: [
                        {
                            elementName: 'move-forward',
                            argMap: {
                                steps: {
                                    elementName: 'value-number',
                                },
                            },
                        },
                        {
                            elementName: 'turn-left',
                            argMap: {
                                angle: {
                                    elementName: 'value-number',
                                },
                            },
                        },
                    ],
                },
            ],
        ],
    });

    getInstance(
        // @ts-ignore
        getNode(generateSnapshot().crumbs[0][0]['argMap']['value'].nodeID)!.instanceID,
    )!.instance.updateLabel('5');
    getInstance(
        // @ts-ignore
        getNode(generateSnapshot().crumbs[0][1]['argMap']['value'].nodeID)!.instanceID,
    )!.instance.updateLabel('4');
    getInstance(
        // @ts-ignore
        getNode(generateSnapshot().crumbs[0][2]['argMap']['times'].nodeID)!.instanceID,
    )!.instance.updateLabel('6');
    getInstance(
        // @ts-ignore
        getNode(generateSnapshot().crumbs[0][2]['scope'][0]['argMap']['steps'].nodeID)!.instanceID,
    )!.instance.updateLabel('200');
    getInstance(
        // @ts-ignore
        getNode(generateSnapshot().crumbs[0][2]['scope'][1]['argMap']['angle'].nodeID)!.instanceID,
    )!.instance.updateLabel('60');

    getInstance(
        // @ts-ignore
        getNode(generateSnapshot().crumbs[0][3]['argMap']['value'].nodeID)!.instanceID,
    )!.instance.updateLabel('9');
    getInstance(
        // @ts-ignore
        getNode(generateSnapshot().crumbs[0][4]['argMap']['value'].nodeID)!.instanceID,
    )!.instance.updateLabel('4');
    getInstance(
        // @ts-ignore
        getNode(generateSnapshot().crumbs[0][5]['argMap']['times'].nodeID)!.instanceID,
    )!.instance.updateLabel('6');
    getInstance(
        // @ts-ignore
        getNode(generateSnapshot().crumbs[0][5]['scope'][0]['argMap']['steps'].nodeID)!.instanceID,
    )!.instance.updateLabel('200');
    getInstance(
        // @ts-ignore
        getNode(generateSnapshot().crumbs[0][5]['scope'][1]['argMap']['angle'].nodeID)!.instanceID,
    )!.instance.updateLabel('60');

    run(getCrumbs()[0].nodeID);
});
