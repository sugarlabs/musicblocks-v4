import type { TowerNode, TowerStatementNode } from '@/@types/tower.types';
import { mockPaletteConfig } from '@/mocks/palette';
import { createBrickModel, wrapAsRootNode } from '@/utils/brick-model-factory';

export function createMockTowerRoot(): TowerNode {
    const getAllBricks = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allBricks: any[] = [];
        for (const classification of mockPaletteConfig.classifications) {
            for (const category of classification.categories) {
                allBricks.push(...category.bricks);
            }
        }
        return allBricks;
    };

    const mockBricks = getAllBricks();

    const getProps = (id: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const brickObj = mockBricks.find((b: any) => b.id === id);
        if (!brickObj) throw new Error(`Brick ${id} not found in palette`);
        return brickObj.brick;
    };

    const stmt = (id: string) =>
        wrapAsRootNode(createBrickModel(getProps(id))) as TowerStatementNode;

    // ── Tower layout ─────────────────────────────────────────────────────────
    //  Note
    //  Repeat
    //    ├─ Pitch       (nested chain)
    //    └─ Rest        (nested chain, next of Pitch)
    //  Note             (next of Repeat)
    //  Tone/Sharp       (next of second Note)

    const note1 = stmt('rhythm.note.1');
    const repeat = stmt('flow.repeat.1');
    const note2 = stmt('rhythm.note.1');
    const sharp = stmt('tone.sharp.1');

    // flat chain: note1 → repeat → note2 → sharp
    note1.next = repeat;
    repeat.prev = note1;

    repeat.next = note2;
    note2.prev = repeat;

    note2.next = sharp;
    sharp.prev = note2;

    // nested chain inside repeat: pitch → rest
    const pitch = stmt('pitch.pitch.1');
    const rest = stmt('rhythm.rest.1');

    repeat.nestedNext = pitch;
    pitch.prev = null;

    pitch.next = rest;
    rest.prev = pitch;

    return note1;
}

export const mockWorkspaceTower = {
    id: 'mock-tower-1',
    root: createMockTowerRoot(),
    position: { x: 50, y: 50 },
};
