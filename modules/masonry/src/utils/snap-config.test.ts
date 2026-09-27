import { describe, expect, it } from 'vitest';

import { BruteForceCollisionSpace } from './collision';
import { querySnap, snapProbeSize } from './snap-config';

describe('snapProbeSize', () => {
    it.each([
        [1, 75],
        [2, 100],
        [3, 125],
    ] as const)('is %i-level brick scale times the 100px box', (level, size) => {
        expect(snapProbeSize(level)).toBe(size);
    });
});

describe('querySnap', () => {
    // A 2px connector, so the probe reaches it while |dx| < half the box + 1.
    const connectorAt = (dx: number) => {
        const space = new BruteForceCollisionSpace(1000, 1000);
        space.createObjects([{ id: 1, x: 500 + dx, y: 500, w: 2, h: 2 }]);
        return space;
    };

    it.each([
        [1, 45, false],
        [2, 45, true],
        [2, 55, false],
        [3, 55, true],
    ] as const)('at level %i, a connector %ipx away snaps: %s', (level, dx, snaps) => {
        const hits = querySnap(connectorAt(dx), { x: 500, y: 500 }, level);
        expect(hits.includes(1)).toBe(snaps);
    });
});
