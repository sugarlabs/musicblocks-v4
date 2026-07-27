import type {
    TowerExpressionNode,
    TowerNode,
    TowerStatementNode,
    TowerValueNode,
} from '@/@types/tower.types';
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

    const stmt = (id: string) => {
        const props = structuredClone(getProps(id));
        return wrapAsRootNode(createBrickModel(props)) as TowerStatementNode;
    };

    const expr = (id: string, customValue?: string) => {
        const props = structuredClone(getProps(id));
        if (customValue !== undefined && 'value' in props.widget) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (props.widget as any).value = customValue;
        }
        return wrapAsRootNode(createBrickModel(props)) as TowerExpressionNode;
    };

    const val = (id: string, customValue?: number | string) => {
        const props = structuredClone(getProps(id));
        if (customValue !== undefined && 'value' in props.widget) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (props.widget as any).value = customValue;
        }
        return wrapAsRootNode(createBrickModel(props)) as TowerValueNode;
    };

    const plugArg = (
        parent: TowerStatementNode | TowerExpressionNode,
        slotIndex: number,
        child: TowerValueNode | TowerExpressionNode,
    ) => {
        parent.args[slotIndex] = child;
        child.parent = parent;
    };

    const linkNext = (prevStmt: TowerStatementNode, nextStmt: TowerStatementNode) => {
        prevStmt.next = nextStmt;
        nextStmt.prev = prevStmt;
    };

    const nestInside = (parentStmt: TowerStatementNode, childStmt: TowerStatementNode) => {
        parentStmt.nestedNext = childStmt;
        childStmt.prev = null;
    };

    // ── Tower layout ─────────────────────────────────────────────────────────
    // start
    //   └─ set instrument (nested chain inside start) [guitar]
    //        ├─ note [value: / (1, 4)]
    //        │    └─ pitch [sol, 4]
    //        ├─ note [value: / (1, 4)]
    //        │    └─ pitch [mi, 4]
    //        └─ note [value: / (1, 2)]
    //             └─ pitch [sol, 4]

    const startNode = stmt('mock.start.1');

    const setInstNode = stmt('mock.setinstrument.1');
    nestInside(startNode, setInstNode);

    const guitarNode = val('mock.guitar.1', 'guitar');
    plugArg(setInstNode, 0, guitarNode);

    // Note 1
    const note1 = stmt('mock.note.1');
    nestInside(setInstNode, note1);

    const div1 = expr('mock.expression.1', '/');
    plugArg(note1, 0, div1);
    plugArg(div1, 0, val('mock.number.1', 1));
    plugArg(div1, 1, val('mock.number.1', 4));

    const pitch1 = stmt('mock.pitch.1');
    nestInside(note1, pitch1);
    plugArg(pitch1, 0, val('mock.sol.1', 'sol'));
    plugArg(pitch1, 1, val('mock.number.1', 4));

    // Note 2
    const note2 = stmt('mock.note.1');
    linkNext(note1, note2);

    const div2 = expr('mock.expression.1', '/');
    plugArg(note2, 0, div2);
    plugArg(div2, 0, val('mock.number.1', 1));
    plugArg(div2, 1, val('mock.number.1', 4));

    const pitch2 = stmt('mock.pitch.1');
    nestInside(note2, pitch2);
    plugArg(pitch2, 0, val('mock.sol.1', 'mi'));
    plugArg(pitch2, 1, val('mock.number.1', 4));

    // Note 3
    const note3 = stmt('mock.note.1');
    linkNext(note2, note3);

    const div3 = expr('mock.expression.1', '/');
    plugArg(note3, 0, div3);
    plugArg(div3, 0, val('mock.number.1', 1));
    plugArg(div3, 1, val('mock.number.1', 2));

    const pitch3 = stmt('mock.pitch.1');
    nestInside(note3, pitch3);
    plugArg(pitch3, 0, val('mock.sol.1', 'sol'));
    plugArg(pitch3, 1, val('mock.number.1', 4));

    return startNode;
}

export const mockWorkspaceTower = {
    id: 'mock-tower-1',
    root: createMockTowerRoot(),
    position: { x: 50, y: 50 },
};
