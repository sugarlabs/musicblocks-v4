/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
    generateFromSnapshot,
    generateSnapshot,
    getInstance,
    getNode,
} from '@sugarlabs/musicblocks-v4-lib';

/*
 * dummy program for debugging
 *
 * set-thickness value:4
 * set-color value:5
 * repeat times:6
 *   move-forward steps:100
 *   turn-right angle:60
 * set-color value:9
 * repeat times:6
 *   move-forward steps:100
 *   turn-left angle:60
 */
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
