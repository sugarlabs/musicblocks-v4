import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Box, GitFork, LayoutGrid } from 'lucide-react';

import Collision from './Collision';
import DragNDrop from './DragNDrop';
import WorkspaceDemo from './Workspace';

export interface PageDef {
    path: string;
    label: string;
    description: string;
    component: ComponentType;
    icon: LucideIcon;
}

export const pages: PageDef[] = [
    {
        path: 'drag-n-drop',
        label: 'Drag & Drop',
        description: 'A simple drag and drop example',
        component: DragNDrop,
        icon: Box,
    },
    {
        path: 'collision',
        label: 'Collision',
        description: 'Demonstrates collision detection',
        component: Collision,
        icon: GitFork,
    },
    {
        path: 'workspace',
        label: 'Workspace',
        description: 'Demonstrates the Workspace in operation',
        component: WorkspaceDemo,
        icon: LayoutGrid,
    },
];
