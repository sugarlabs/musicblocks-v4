import type { ComponentType } from 'react';

export interface PageDef {
    path: string;
    label: string;
    description: string;
    component: ComponentType;
}

export const pages: PageDef[] = [];
