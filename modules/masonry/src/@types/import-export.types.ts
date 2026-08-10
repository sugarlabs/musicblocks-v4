export interface ExportedProject {
    towers: ExportedTower[];
    nodes: Record<string, ExportedNode>;
}

export interface ExportedTower {
    id: string;
    position: { x: number; y: number };
    rootNodeId: string;
}

export type ExportedNode = {
    id: string;
    kind: 'value' | 'expression' | 'statement';

    // 1. Brick Configuration (What is stored for the brick)
    modelConfig: {
        id: string;
        colorsDefault: { background: string; foreground: string; border: string };
        tooltipText: string;
        scaleLevel: 1 | 2 | 3;
        widget: Record<string, unknown>; // Contains user-entered values
        params?: (string | null)[];
        hasNesting?: boolean;
        isNestingFolded?: boolean;
    };

    // 2. Structural Pointers (What the brick is connected to)
    args: (string | null)[];
    next?: string | null;
    nestedNext?: string | null;
};
