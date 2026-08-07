import { checkCollision } from '../utils';
import type { TCollisionObject } from '../../@types/collision';

describe('Code Builder: Collision > Utility', () => {
    const objA: TCollisionObject = { id: 'A', x: 10, y: 10, width: 10, height: 10 };

    describe('circle collision', () => {
        const testCases = [
            { label: 'detects overlap', x: 14, y: 10, threshold: 0, expected: true },
            { label: 'ignores separation', x: 25, y: 10, threshold: 0, expected: false },
            {
                label: 'applies threshold (not overlapping enough)',
                x: 16,
                y: 10,
                threshold: 0.5,
                expected: false,
            },
            {
                label: 'applies threshold (overlapping enough)',
                x: 16,
                y: 10,
                threshold: 0.2,
                expected: true,
            },
        ];

        testCases.forEach(({ label, x, y, threshold, expected }) => {
            it(label, () => {
                const objB = { id: 'B', x, y, width: 10, height: 10 };
                expect(checkCollision(objA, objB, { objType: 'circle', colThres: threshold })).toBe(
                    expected,
                );
            });
        });
    });

    describe('rectangle collision', () => {
        const testCases = [
            { label: 'detects overlap', x: 14, y: 10, threshold: 0, expected: true },
            { label: 'ignores separation', x: 25, y: 10, threshold: 0, expected: false },
            {
                label: 'applies threshold (overlapping enough)',
                x: 14,
                y: 10,
                threshold: 0.5,
                expected: true,
            },
            {
                label: 'applies threshold (not overlapping enough)',
                x: 14,
                y: 10,
                threshold: 0.7,
                expected: false,
            },
        ];

        testCases.forEach(({ label, x, y, threshold, expected }) => {
            it(label, () => {
                const objB = { id: 'B', x, y, width: 10, height: 10 };
                expect(checkCollision(objA, objB, { objType: 'rect', colThres: threshold })).toBe(
                    expected,
                );
            });
        });
    });
});
