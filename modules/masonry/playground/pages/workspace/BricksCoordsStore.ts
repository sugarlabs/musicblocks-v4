import { create } from 'zustand';

type CoordsState = {
    allCoords: {
        brickId: string;
        coords: {
            x: number;
            y: number;
        };
    }[];
    setCoords: (brickId: string, coords: { x: number; y: number }) => void;
    getCoords: (brickId: string) => { x: number; y: number } | undefined;
};

const useBricksCoordsStore = create<CoordsState>((set, get) => ({
    allCoords: [
        { brickId: '1', coords: { x: 50, y: 50 } },
        { brickId: '2', coords: { x: 68, y: 92 } },
        { brickId: '3', coords: { x: 68, y: 134 } },
        { brickId: '4', coords: { x: 68, y: 176 } },
        { brickId: '5', coords: { x: 86, y: 218 } },
        { brickId: '6', coords: { x: 68, y: 302 } },
    ],
    setCoords: (brickId: string, coords: { x: number; y: number }) =>
        set(
            (state: {
                allCoords: {
                    brickId: string;
                    coords: {
                        x: number;
                        y: number;
                    };
                }[];
            }) => ({
                allCoords: state.allCoords.map((item) =>
                    item.brickId === brickId ? { brickId, coords } : item,
                ),
            }),
        ),
    getCoords: (brickId: string) =>
        get().allCoords.find((item) => item.brickId === brickId)?.coords,
}));

export const useBricksCoords = () => {
    const allCoords = useBricksCoordsStore((state) => state.allCoords);
    const setCoords = useBricksCoordsStore((state) => state.setCoords);
    const getCoords = useBricksCoordsStore((state) => state.getCoords);

    return { allCoords, setCoords, getCoords };
};
