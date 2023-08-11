import {
    ModelBrickBlock,
    ModelBrickData,
    ModelBrickExpression,
    ModelBrickStatement,
} from '@/brick';
import type { TBrickType, TBrickCoords, TBrickArgDataType } from '@/@types/brick';

type InstanceMap = {
    data: ModelBrickData;
    expression: ModelBrickExpression;
    statement: ModelBrickStatement;
    block: ModelBrickBlock;
};

export type Brick = {
    id: string;
    type: TBrickType;
    instance: InstanceMap[TBrickType];
    surroundingBricks: { above: string; below: string };
    childBricks: string[];
    coords: TBrickCoords;
    children?: Brick[];
};

export const WORKSPACES_DATA: { id: string; data: Brick[] }[] = [
    {
        id: 'workspace1',
        data: [
            {
                id: '1',
                type: 'block',
                instance: new ModelBrickBlock({
                    label: 'Block',
                    args: Object.fromEntries(
                        [].map<
                            [string, { label: string; dataType: TBrickArgDataType; meta: unknown }]
                        >((name) => [name, { label: name, dataType: 'any', meta: undefined }]),
                    ),
                    colorBg: 'yellow',
                    colorFg: 'black',
                    outline: 'red',
                    scale: 2,
                    glyph: '',
                    connectAbove: true,
                    connectBelow: true,
                    name: '',
                    nestLengthY: 125,
                }),
                surroundingBricks: { above: '', below: '' },
                childBricks: ['2', '3', '4', '5', '6'],
                coords: { x: 50, y: 50 },
                children: [
                    {
                        id: '2',
                        type: 'statement',
                        instance: new ModelBrickStatement({
                            label: 'Statement',
                            args: Object.fromEntries(
                                [].map<
                                    [
                                        string,
                                        {
                                            label: string;
                                            dataType: TBrickArgDataType;
                                            meta: unknown;
                                        },
                                    ]
                                >((name) => [
                                    name,
                                    { label: name, dataType: 'any', meta: undefined },
                                ]),
                            ),
                            colorBg: 'lightblue',
                            colorFg: 'black',
                            outline: 'blue',
                            scale: 2,
                            glyph: '',
                            connectAbove: true,
                            connectBelow: true,
                            name: '',
                        }),
                        surroundingBricks: { above: '1', below: '3' },
                        childBricks: [],
                        coords: { x: 68, y: 92 },
                    },
                    {
                        id: '3',
                        type: 'statement',
                        instance: new ModelBrickStatement({
                            label: 'Statement',
                            args: Object.fromEntries(
                                [].map<
                                    [
                                        string,
                                        {
                                            label: string;
                                            dataType: TBrickArgDataType;
                                            meta: unknown;
                                        },
                                    ]
                                >((name) => [
                                    name,
                                    { label: name, dataType: 'any', meta: undefined },
                                ]),
                            ),
                            colorBg: 'lightgreen',
                            colorFg: 'black',
                            outline: 'green',
                            scale: 2,
                            glyph: '',
                            connectAbove: true,
                            connectBelow: true,
                            name: '',
                        }),
                        surroundingBricks: { above: '2', below: '4' },
                        childBricks: [],
                        coords: { x: 68, y: 134 },
                    },
                    {
                        id: '4',
                        type: 'block',
                        instance: new ModelBrickBlock({
                            label: 'Block',
                            args: Object.fromEntries(
                                [].map<
                                    [
                                        string,
                                        {
                                            label: string;
                                            dataType: TBrickArgDataType;
                                            meta: unknown;
                                        },
                                    ]
                                >((name) => [
                                    name,
                                    { label: name, dataType: 'any', meta: undefined },
                                ]),
                            ),
                            colorBg: 'orange',
                            colorFg: 'black',
                            outline: 'grey',
                            scale: 2,
                            glyph: '',
                            connectAbove: true,
                            connectBelow: true,
                            name: '',
                            nestLengthY: 17,
                        }),
                        surroundingBricks: { above: '3', below: '6' },
                        childBricks: ['5'],
                        coords: { x: 68, y: 176 },
                        children: [
                            {
                                id: '5',
                                type: 'statement',
                                instance: new ModelBrickStatement({
                                    label: 'Statement',
                                    args: Object.fromEntries(
                                        [].map<
                                            [
                                                string,
                                                {
                                                    label: string;
                                                    dataType: TBrickArgDataType;
                                                    meta: unknown;
                                                },
                                            ]
                                        >((name) => [
                                            name,
                                            { label: name, dataType: 'any', meta: undefined },
                                        ]),
                                    ),
                                    colorBg: 'lightpink',
                                    colorFg: 'black',
                                    outline: 'deeppink',

                                    scale: 2,
                                    glyph: '',
                                    connectAbove: true,
                                    connectBelow: true,
                                    name: '',
                                }),
                                surroundingBricks: { above: '', below: '' },
                                childBricks: [],
                                coords: { x: 86, y: 218 },
                            },
                        ],
                    },
                    {
                        id: '6',
                        type: 'statement',
                        instance: new ModelBrickStatement({
                            label: 'Statement',
                            args: Object.fromEntries(
                                [].map<
                                    [
                                        string,
                                        {
                                            label: string;
                                            dataType: TBrickArgDataType;
                                            meta: unknown;
                                        },
                                    ]
                                >((name) => [
                                    name,
                                    { label: name, dataType: 'any', meta: undefined },
                                ]),
                            ),
                            colorBg: 'lightgreen',
                            colorFg: 'black',
                            outline: 'green',
                            scale: 2,
                            glyph: '',
                            connectAbove: true,
                            connectBelow: true,
                            name: '',
                        }),
                        surroundingBricks: { above: '4', below: '' },
                        childBricks: [],
                        coords: { x: 68, y: 302 },
                    },
                ],
            },
        ],
    },
];
