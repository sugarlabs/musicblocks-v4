import { atom } from 'recoil';
import TowerModel from '../tower/model/model';

export const towersAtom = atom<TowerModel[]>({
    key: 'towers',
    default: [],
});
