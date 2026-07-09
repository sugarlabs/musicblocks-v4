import type { ComponentType } from 'react';

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
        path: 'workspace',
        label: 'Workspace',
        description: 'Demonstrates the Workspace in operation',
        component: WorkspaceDemo,
    },
];
