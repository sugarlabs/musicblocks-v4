export interface BrickConfig {
    id: string;
    category: string;
    label: string;
    type: 'simple' | 'expression' | 'compound';
    color: string;
    argCount: number;
    notches: { top: boolean; bottom: boolean; connection: boolean };
}

export interface CategoryConfig {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
}
