import reportWebVitals from './reportWebVitals';
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// =================================================================================================

import React from 'react';
import ReactDOM from 'react-dom';

import App from './view/App';

ReactDOM.render(
    React.createElement(React.StrictMode, null, App()),
    document.getElementById('root'),
);

setTimeout(() => import('./config'));

// -------------------------------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
    generateFromSnapshot,
    generateSnapshot,
    getCrumbs,
    getInstance,
    getNode,
    registerElementSpecificationEntries,
    run,
} from '@sugarlabs/musicblocks-v4-lib';

import { librarySpecification } from '@sugarlabs/musicblocks-v4-lib';
registerElementSpecificationEntries(librarySpecification);

// dummy program for debugging
window.addEventListener('runprogram', () => {
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

// =================================================================================================

// import './archive/index';
