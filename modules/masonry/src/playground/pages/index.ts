import type { ComponentType } from 'react';

import Collision from './Collision';
import DragNDrop from './DragNDrop';
import WorkspaceDemo from './Workspace';

export interface PageDef {
    path: string;
    label: string;
    description: string;
    component: ComponentType;
}

export const pages: PageDef[] = [
    {
        path: 'drag-n-drop',
        label: 'Drag & Drop',
        description: 'A simple drag and drop example',
        component: DragNDrop,
    },
    {
        path: 'collision',
        label: 'Collision',
        description: 'Demonstrates collision detection',
        component: Collision,
    },
    {
        path: 'workspace',
        label: 'Workspace',
        description: 'Demonstrates the Workspace in operation',
        component: WorkspaceDemo,
    },
];
