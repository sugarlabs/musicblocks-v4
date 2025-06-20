import { LayeredMap } from './utils';

// -------------------------------------------------------------------------------------------------

describe('Utils module', () => {
    describe('class LayeredMap', () => {
        /**
         *  K1    K2   K3   K4   K5   K6   K7   K8      K9   KA
         * ========================== A ========================
         * | a -- b -- c -- d ------- i                        |  1
         * =====================================================
         *           ====== B ======     ==== D ===   ==== E ===
         *           | e -- f -- h |     | j -- k |   | l -----|  2
         *           ===============     ==========   ==========
         *                = C =                            = F =
         *                | g |                            | m |  3
         *                =====                            =====
         */

        let map: LayeredMap<Record<string, string>>;
        let A: string;
        let B: string;
        let C: string;
        let D: string;
        let E: string;
        let F: string;

        it('instantiates with root frame key-map', () => {
            map = new LayeredMap({ K1: 'a', K2: 'b' });
            A = map.rootID;

            expect(
                Object.entries(map.projectFlatMap(A))
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([key, value]) => `${key}-${value}`)
                    .join(', '),
            ).toBe('K1-a, K2-b');
        });

        it('adds frames with existing parent ID', () => {
            expect(() => {
                B = map.addFrame(A);
            }).not.toThrowError();
            expect(() => {
                C = map.addFrame(B);
            }).not.toThrowError();
            expect(() => {
                D = map.addFrame(A);
            }).not.toThrowError();
            expect(() => {
                E = map.addFrame(A);
            }).not.toThrowError();
            expect(() => {
                F = map.addFrame(E);
            }).not.toThrowError();
        });

        it('throws error on adding frame with non-existing parent ID', () => {
            expect(() => {
                map.addFrame('foobar');
            }).toThrowError(`UndefinedError: Frame with ID "foobar" doesn't exist`);
        });

        it('throws error on updating key-map of non-existing frame', () => {
            expect(() => {
                map.updateFrameKeyMap('foobar', { K1: 'a' });
            }).toThrowError(`UndefinedError: Frame with ID "foobar" doesn't exist`);
        });

        it('updates key-map of existing frames', () => {
            expect(() => {
                map.updateFrameKeyMap(A, { K1: 'a', K2: 'b', K3: 'c', K4: 'd', K6: 'i' });
                map.updateFrameKeyMap(B, { K3: 'e', K4: 'f', K5: 'h' });
                map.updateFrameKeyMap(C, { K4: 'g' });
                map.updateFrameKeyMap(D, { K7: 'j', K8: 'k' });
                map.updateFrameKeyMap(E, { K9: 'l' });
                map.updateFrameKeyMap(F, { KA: 'm' });
            }).not.toThrowError();
        });

        it('throws error on projecting flat map from non-existing frame', () => {
            expect(() => {
                map.projectFlatMap('foobar');
            }).toThrowError(`UndefinedError: Frame with ID "foobar" doesn't exist`);
        });

        it('projects flat map from an existing frame', () => {
            const format = (id: string) =>
                Object.entries(map.projectFlatMap(id))
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}-${v}`)
                    .join(', ');

            expect(format(A)).toBe('K1-a, K2-b, K3-c, K4-d, K6-i');
            expect(format(B)).toBe('K1-a, K2-b, K3-e, K4-f, K5-h, K6-i');
            expect(format(C)).toBe('K1-a, K2-b, K3-e, K4-g, K5-h, K6-i');
            expect(format(D)).toBe('K1-a, K2-b, K3-c, K4-d, K6-i, K7-j, K8-k');
            expect(format(E)).toBe('K1-a, K2-b, K3-c, K4-d, K6-i, K9-l');
            expect(format(F)).toBe('K1-a, K2-b, K3-c, K4-d, K6-i, K9-l, KA-m');
        });

        it('throws error on removing non-existing frame', () => {
            expect(() => {
                map.removeFrame('foobar');
            }).toThrowError(`UndefinedError: Frame with ID "foobar" doesn't exist`);
        });

        it('throws error on removing root frame', () => {
            expect(() => {
                map.removeFrame(A);
            }).toThrowError('InvalidOperationError: Cannot remove root frame');
        });

        it('throws error on removing non-leaf frame', () => {
            expect(() => {
                map.removeFrame(E);
            }).toThrowError('InvalidOperationError: Frame has child frames');
        });

        it('removes existing leaf frame', () => {
            expect(() => {
                map.removeFrame(F);
            }).not.toThrowError();
            expect(() => {
                map.removeFrame(E);
            }).not.toThrowError();
        });
    });
});
