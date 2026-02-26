import { atom } from 'recoil';

export interface KeyboardInsertState {
    brickId: string;
}

export const keyboardInsertStateAtom = atom<KeyboardInsertState | null>({
    key: 'keyboardInsertState',
    default: null,
});
