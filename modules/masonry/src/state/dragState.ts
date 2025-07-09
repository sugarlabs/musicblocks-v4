import { atom } from 'recoil';

export interface DragState {
    brickType: string | null;
    origin: 'palette' | 'tower' | null;
}

export const dragStateAtom = atom<DragState>({
    key: 'dragState',
    default: { brickType: null, origin: null },
});
