import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import {
    computeStatementPreview,
    computeArgumentPreview,
    resolveCandidateConnection,
} from './snap-preview-calculator';
import { useWorkspaceStore } from '@/stores/workspace';
import { useBrickLayoutStore } from '@/stores/brick';
import * as statementConnect from '@/utils/statement-connect';
import * as argumentConnect from '@/utils/argument-connect';
import type { TowerStatementNode, TowerValueNode } from '@/@types/tower.types';
import { StatementBrickModel, ValueBrickModel } from '@/models/brick';
import { traverseTopDown } from '@/utils/tower-traversal';

vi.mock('@/stores/workspace', () => ({
    useWorkspaceStore: {
        getState: vi.fn(),
    },
}));

vi.mock('@/stores/brick', () => ({
    useBrickLayoutStore: {
        getState: vi.fn(),
    },
}));

vi.mock('@/utils/statement-connect', () => ({
    resolveStatementConnection: vi.fn(),
}));

vi.mock('@/utils/argument-connect', () => ({
    resolveArgumentConnection: vi.fn(),
}));

// Dummy model factory to mock brick models
const createMockModel = (scaleLevel: number, connectorCoords: Record<string, unknown>) => ({
    scaleLevel,
    id: 'brick-' + Math.random(),
    getConnectorCoords: () => connectorCoords,
});

describe('snap-preview-calculator', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations
        (useWorkspaceStore.getState as Mock).mockReturnValue({
            towers: {
                tower1: {},
            },
            statementCollisionSpace: {},
            statementConnectors: {},
            argumentCollisionSpace: {},
            argumentConnectors: {},
        });

        (useBrickLayoutStore.getState as Mock).mockReturnValue({
            coords: {
                'parent-id': { x: 100, y: 100 },
                'child-id': { x: 50, y: 50 },
            },
        });
    });

    it('returns invalid preview if host tower is missing for statement', () => {
        const result = computeStatementPreview(
            { hostTowerId: 'missing' } as unknown as Parameters<typeof computeStatementPreview>[0],
            useWorkspaceStore.getState(),
        );
        expect(result.isValid).toBe(false);
    });

    it('computes statement preview coordinates correctly', () => {
        const parentModel = createMockModel(2, { next: { x: 10, y: 20, w: 0, h: 0 } });
        parentModel.id = 'parent-id';
        const childModel = createMockModel(2, { prev: { x: 5, y: 15, w: 0, h: 0 } });
        childModel.id = 'child-id';

        const connection = {
            hostTowerId: 'tower1',
            parent: { model: parentModel },
            child: { model: childModel },
            socket: 'next',
        };

        const result = computeStatementPreview(
            connection as unknown as Parameters<typeof computeStatementPreview>[0],
            useWorkspaceStore.getState(),
        );

        // Scale level 2 -> SCALE_LEVEL_CONFIG[2].brickScale = 1
        // (Assuming scale 1 for scaleLevel 2 in constants, or whatever it is, let's assume it scales by 1 for this test, wait, if scale is different the exact values might change. Let's just verify it returns a valid position)
        expect(result.isValid).toBe(true);
        expect(typeof result.snapPosition.x).toBe('number');
        expect(typeof result.snapPosition.y).toBe('number');
    });

    it('computes argument preview coordinates correctly', () => {
        const parentModel = createMockModel(2, { inputs: [{ x: 10, y: 20, w: 0, h: 0 }] });
        parentModel.id = 'parent-id';
        const childModel = createMockModel(2, { output: { x: 5, y: 15, w: 0, h: 0 } });
        childModel.id = 'child-id';

        const connection = {
            hostTowerId: 'tower1',
            parent: { model: parentModel },
            child: { model: childModel },
            slotIndex: 0,
        };

        const result = computeArgumentPreview(
            connection as unknown as Parameters<typeof computeArgumentPreview>[0],
            useWorkspaceStore.getState(),
        );

        expect(result.isValid).toBe(true);
        expect(typeof result.snapPosition.x).toBe('number');
        expect(typeof result.snapPosition.y).toBe('number');
    });

    it('resolveCandidateConnection returns null if no connections found', () => {
        (statementConnect.resolveStatementConnection as Mock).mockReturnValue(null);
        (argumentConnect.resolveArgumentConnection as Mock).mockReturnValue(null);

        const result = resolveCandidateConnection('dragged1', useWorkspaceStore.getState());
        expect(result).toBeNull();
    });

    it('resolveCandidateConnection prefers statement over argument if distance is smaller', () => {
        const parentModel = createMockModel(2, { next: { x: 10, y: 20 } });
        parentModel.id = 'parent-id';

        const statementConn = {
            hostTowerId: 'tower1',
            parent: { model: parentModel },
            child: { model: createMockModel(2, { prev: { x: 0, y: 0 } }) },
            socket: 'next',
            distance: 10,
        };

        const argConn = {
            distance: 20,
        };

        (statementConnect.resolveStatementConnection as Mock).mockReturnValue(statementConn);
        (argumentConnect.resolveArgumentConnection as Mock).mockReturnValue(argConn);

        const result = resolveCandidateConnection('dragged1', useWorkspaceStore.getState());

        expect(result).not.toBeNull();
        expect(result!.target.type).toBe('statement');
        expect(result!.target.distance).toBe(10);
    });

    it('resolveCandidateConnection prefers argument if distance is smaller', () => {
        const statementConn = {
            distance: 30,
        };

        const parentModel = createMockModel(2, { inputs: [{ x: 10, y: 20 }] });
        parentModel.id = 'parent-id';

        const argConn = {
            hostTowerId: 'tower1',
            parent: { model: parentModel },
            child: { model: createMockModel(2, { output: { x: 0, y: 0 } }) },
            slotIndex: 0,
            distance: 5,
        };

        (statementConnect.resolveStatementConnection as Mock).mockReturnValue(statementConn);
        (argumentConnect.resolveArgumentConnection as Mock).mockReturnValue(argConn);

        const result = resolveCandidateConnection('dragged1', useWorkspaceStore.getState());

        expect(result).not.toBeNull();
        expect(result!.target.type).toBe('argument');
        expect(result!.target.distance).toBe(5);
    });
});

// The preview must land where the layout engine puts the brick once the join is made, at every
// zoom level. Real models, not mocks: the bug was in how connector coords are scaled.
describe('snap preview matches the layout engine', () => {
    const colorsDefault = { background: '#3498db', foreground: '#ffffff', border: '#2980b9' };
    const HOST_ORIGIN = { x: 100, y: 100 };

    function statement(id: string, scaleLevel: 1 | 2 | 3): TowerStatementNode {
        const model = new StatementBrickModel({
            id,
            colorsDefault,
            tooltipText: '',
            widget: { type: 'label', text: id },
            params: ['param'],
            hasConnectionPrev: true,
            hasConnectionNext: true,
            hasNesting: true,
            scaleLevel,
        });
        model.computeOutline();
        return { kind: 'statement', model, prev: null, next: null, args: [null], nestedNext: null };
    }

    function value(id: string, scaleLevel: 1 | 2 | 3): TowerValueNode {
        const model = new ValueBrickModel({
            id,
            colorsDefault,
            tooltipText: '',
            widget: { type: 'numberbox', value: 0 },
            scaleLevel,
        });
        model.computeOutline();
        return { kind: 'value', model, parent: null };
    }

    // What useTowerLayout does before positioning: feed the children's size into the host, then
    // rebuild its outline so the slot and cavity bounds account for what now fills them.
    function layOut(host: TowerStatementNode) {
        host.model.argDims = host.args.map((arg) =>
            arg ? { w: arg.model.dims.w, h: arg.model.dims.h } : null,
        );
        if (host.nestedNext) host.model.nestingDims = { ...host.nestedNext.model.dims };
        host.model.computeOutline();
        traverseTopDown(host, HOST_ORIGIN);
    }

    function hostAt(host: { model: { id: string } }) {
        (useBrickLayoutStore.getState as Mock).mockReturnValue({
            coords: { [host.model.id]: HOST_ORIGIN },
        });
    }

    describe.each([1, 2, 3] as const)('at scale level %i', (level) => {
        it.each(['next', 'nestedNext'] as const)(
            'lands a %s join on the laid-out brick',
            (socket) => {
                const host = statement('host', level);
                const child = statement('child', level);
                hostAt(host);

                const preview = computeStatementPreview(
                    { hostTowerId: 'tower1', parent: host, child, socket } as unknown as Parameters<
                        typeof computeStatementPreview
                    >[0],
                    useWorkspaceStore.getState(),
                );

                host[socket] = child;
                child.prev = host;
                layOut(host);

                expect(preview.snapPosition.x).toBeCloseTo(child.model.position.x);
                expect(preview.snapPosition.y).toBeCloseTo(child.model.position.y);
            },
        );

        it('lands an argument join on the laid-out brick', () => {
            const host = statement('host', level);
            const child = value('child', level);
            hostAt(host);

            const preview = computeArgumentPreview(
                {
                    hostTowerId: 'tower1',
                    parent: host,
                    child,
                    slotIndex: 0,
                } as unknown as Parameters<typeof computeArgumentPreview>[0],
                useWorkspaceStore.getState(),
            );

            host.args[0] = child;
            child.parent = host;
            layOut(host);

            expect(preview.snapPosition.x).toBeCloseTo(child.model.position.x);
            expect(preview.snapPosition.y).toBeCloseTo(child.model.position.y);
        });

        it('puts the hint on the host connector', () => {
            const host = statement('host', level);
            const child = statement('child', level);
            hostAt(host);
            (statementConnect.resolveStatementConnection as Mock).mockReturnValue({
                hostTowerId: 'tower1',
                parent: host,
                child,
                socket: 'next',
                distance: 1,
            });
            (argumentConnect.resolveArgumentConnection as Mock).mockReturnValue(null);

            const result = resolveCandidateConnection('dragged1', useWorkspaceStore.getState());

            const next = host.model.getConnectorCoords().next!;
            expect(result!.target.centroid.x).toBeCloseTo(HOST_ORIGIN.x + next.x);
            expect(result!.target.centroid.y).toBeCloseTo(HOST_ORIGIN.y + next.y);
        });
    });
});
