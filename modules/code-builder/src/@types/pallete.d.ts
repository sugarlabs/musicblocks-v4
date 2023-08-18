export type PalleteProps = {
    config: {
        data: [];
    };
    reset: boolean;
    onBrickDrop: (brick: any) => void;
};

export type Tab = 'flow' | 'music' | 'graphic';
