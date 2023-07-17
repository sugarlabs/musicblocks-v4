import { generatePath } from '../path';

describe('Code Builder: Brick > Design 0 > Utility: Path', () => {
    describe('Path Generation', () => {
        it('generates path with arguments of different extents', () => {
            {
                const { path } = generatePath({
                    hasNest: false,
                    hasNotchArg: false,
                    hasNotchInsTop: false,
                    hasNotchInsBot: false,
                    scale: 1,
                    innerLengthX: 100,
                    argHeights: [20],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 h 10 h 78 a 4 4 90 0 1 4 4 v 0 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 0 v 0 a 4 4 90 0 1 -4 4 h -78 h -10 h -4 a 4 4 90 0 1 -4 -4 v -0 v -12 z',
                );
            }

            {
                const { path } = generatePath({
                    hasNest: false,
                    hasNotchArg: false,
                    hasNotchInsTop: false,
                    hasNotchInsBot: false,
                    scale: 1,
                    innerLengthX: 100,
                    argHeights: [20, 20],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 h 10 h 78 a 4 4 90 0 1 4 4 v 0 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 4 v 0 v 4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 0 v 0 a 4 4 90 0 1 -4 4 h -78 h -10 h -4 a 4 4 90 0 1 -4 -4 v -20 v -12 z',
                );
            }

            {
                const { path } = generatePath({
                    hasNest: false,
                    hasNotchArg: false,
                    hasNotchInsTop: false,
                    hasNotchInsBot: false,
                    scale: 1,
                    innerLengthX: 100,
                    argHeights: [20, 20, 20],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 h 10 h 78 a 4 4 90 0 1 4 4 v 0 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 4 v 0 v 4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 4 v 0 v 4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 0 v 0 a 4 4 90 0 1 -4 4 h -78 h -10 h -4 a 4 4 90 0 1 -4 -4 v -40 v -12 z',
                );
            }

            {
                const { path } = generatePath({
                    hasNest: false,
                    hasNotchArg: false,
                    hasNotchInsTop: false,
                    hasNotchInsBot: false,
                    scale: 1,
                    innerLengthX: 100,
                    argHeights: [40, 20, 20],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 h 10 h 78 a 4 4 90 0 1 4 4 v 0 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 4 v 20 v 4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 4 v 0 v 4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 0 v 0 a 4 4 90 0 1 -4 4 h -78 h -10 h -4 a 4 4 90 0 1 -4 -4 v -60 v -12 z',
                );
            }

            {
                const { path } = generatePath({
                    hasNest: false,
                    hasNotchArg: false,
                    hasNotchInsTop: false,
                    hasNotchInsBot: false,
                    scale: 1,
                    innerLengthX: 100,
                    argHeights: [20, 40, 20],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 h 10 h 78 a 4 4 90 0 1 4 4 v 0 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 4 v 0 v 4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 4 v 20 v 4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 0 v 0 a 4 4 90 0 1 -4 4 h -78 h -10 h -4 a 4 4 90 0 1 -4 -4 v -60 v -12 z',
                );
            }

            {
                const { path } = generatePath({
                    hasNest: false,
                    hasNotchArg: false,
                    hasNotchInsTop: false,
                    hasNotchInsBot: false,
                    scale: 1,
                    innerLengthX: 100,
                    argHeights: [20, 20, 40],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 h 10 h 78 a 4 4 90 0 1 4 4 v 0 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 4 v 0 v 4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 4 v 0 v 4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 0 v 20 a 4 4 90 0 1 -4 4 h -78 h -10 h -4 a 4 4 90 0 1 -4 -4 v -60 v -12 z',
                );
            }
        });

        it('generates path with argument notch and no arguments', () => {
            {
                const { path } = generatePath({
                    hasNest: false,
                    hasNotchArg: true,
                    hasNotchInsTop: false,
                    hasNotchInsBot: false,
                    scale: 1,
                    innerLengthX: 100,
                    argHeights: [],
                });
                expect(path).toBe(
                    'm 8.5 4.5 a 4 4 90 0 1 4 -4 h 4 h 10 h 78 a 4 4 90 0 1 4 4 v 12 a 4 4 90 0 1 -4 4 h -78 h -10 h -4 a 4 4 90 0 1 -4 -4 v -0 v -5 h -6 v 3 h -2 v -8 h 2 v 3 h 6 v -5 z',
                );
            }
        });

        it('generates path with argument notch and arguments', () => {
            {
                const { path } = generatePath({
                    hasNest: false,
                    hasNotchArg: true,
                    hasNotchInsTop: false,
                    hasNotchInsBot: false,
                    scale: 1,
                    innerLengthX: 100,
                    argHeights: [20, 20],
                });
                expect(path).toBe(
                    'm 8.5 4.5 a 4 4 90 0 1 4 -4 h 4 h 10 h 78 a 4 4 90 0 1 4 4 v 0 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 4 v 0 v 4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 0 v 0 a 4 4 90 0 1 -4 4 h -78 h -10 h -4 a 4 4 90 0 1 -4 -4 v -20 v -5 h -6 v 3 h -2 v -8 h 2 v 3 h 6 v -5 z',
                );
            }
        });

        it('generates path with both instruction notches and no arguments', () => {
            {
                const { path } = generatePath({
                    hasNest: false,
                    hasNotchArg: false,
                    hasNotchInsTop: true,
                    hasNotchInsBot: true,
                    scale: 1,
                    innerLengthX: 100,
                    argHeights: [],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 v 2 h 10 v -2 h 78 a 4 4 90 0 1 4 4 v 12 a 4 4 90 0 1 -4 4 h -78 h -1 v 2 h -8 v -2 h -1 h -4 a 4 4 90 0 1 -4 -4 v -0 v -12 z',
                );
            }
        });

        it('generates path with both instruction notches and arguments', () => {
            {
                const { path } = generatePath({
                    hasNest: false,
                    hasNotchArg: false,
                    hasNotchInsTop: true,
                    hasNotchInsBot: true,
                    scale: 1,
                    innerLengthX: 100,
                    argHeights: [20, 20],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 v 2 h 10 v -2 h 78 a 4 4 90 0 1 4 4 v 0 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 4 v 0 v 4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 0 v 0 a 4 4 90 0 1 -4 4 h -78 h -1 v 2 h -8 v -2 h -1 h -4 a 4 4 90 0 1 -4 -4 v -20 v -12 z',
                );
            }
        });

        it('generates path with top instruction notch and no arguments', () => {
            {
                const { path } = generatePath({
                    hasNest: false,
                    hasNotchArg: false,
                    hasNotchInsTop: true,
                    hasNotchInsBot: false,
                    scale: 1,
                    innerLengthX: 100,
                    argHeights: [],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 v 2 h 10 v -2 h 78 a 4 4 90 0 1 4 4 v 12 a 4 4 90 0 1 -4 4 h -78 h -10 h -4 a 4 4 90 0 1 -4 -4 v -0 v -12 z',
                );
            }
        });

        it('generates path with top instruction notch and arguments', () => {
            {
                const { path } = generatePath({
                    hasNest: false,
                    hasNotchArg: false,
                    hasNotchInsTop: true,
                    hasNotchInsBot: false,
                    scale: 1,
                    innerLengthX: 100,
                    argHeights: [20, 20],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 v 2 h 10 v -2 h 78 a 4 4 90 0 1 4 4 v 0 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 4 v 0 v 4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 0 v 0 a 4 4 90 0 1 -4 4 h -78 h -10 h -4 a 4 4 90 0 1 -4 -4 v -20 v -12 z',
                );
            }
        });

        it('generates path with bottom instruction notch and no arguments', () => {
            {
                const { path } = generatePath({
                    hasNest: false,
                    hasNotchArg: false,
                    hasNotchInsTop: false,
                    hasNotchInsBot: true,
                    scale: 1,
                    innerLengthX: 100,
                    argHeights: [],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 h 10 h 78 a 4 4 90 0 1 4 4 v 12 a 4 4 90 0 1 -4 4 h -78 h -1 v 2 h -8 v -2 h -1 h -4 a 4 4 90 0 1 -4 -4 v -0 v -12 z',
                );
            }
        });

        it('generates path with bottom instruction notch and arguments', () => {
            {
                const { path } = generatePath({
                    hasNest: false,
                    hasNotchArg: false,
                    hasNotchInsTop: false,
                    hasNotchInsBot: true,
                    scale: 1,
                    innerLengthX: 100,
                    argHeights: [20, 20],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 h 10 h 78 a 4 4 90 0 1 4 4 v 0 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 4 v 0 v 4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 0 v 0 a 4 4 90 0 1 -4 4 h -78 h -1 v 2 h -8 v -2 h -1 h -4 a 4 4 90 0 1 -4 -4 v -20 v -12 z',
                );
            }
        });

        it('generates path with nesting, both instruction notches, and no arguments', () => {
            {
                const { path } = generatePath({
                    hasNest: true,
                    hasNotchArg: false,
                    hasNotchInsTop: true,
                    hasNotchInsBot: true,
                    scale: 1,
                    innerLengthX: 100,
                    nestLengthY: 40,
                    argHeights: [],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 v 2 h 10 v -2 h 78 a 4 4 90 0 1 4 4 v 12 a 4 4 90 0 1 -4 4 h -69 h -1 v 2 h -8 v -2 h -1 h -4 a 5 5 90 0 0 -5 5 v 32 a 5 5 90 0 0 5 5 h 4 v 2 h 10 v -2 h 4 a 4 4 90 0 1 4 4 v 12 a 4 4 90 0 1 -4 4 h -1 h -12 h -1 v 2 h -8 v -2 h -1 h -4 a 4 4 90 0 1 -4 -4 v -20 v -1 v -32 v -1 v -8 v -0 v -12 z',
                );
            }
        });

        it('generates path with nesting, both instruction notches, and arguments', () => {
            {
                const { path } = generatePath({
                    hasNest: true,
                    hasNotchArg: false,
                    hasNotchInsTop: true,
                    hasNotchInsBot: true,
                    scale: 1,
                    innerLengthX: 100,
                    nestLengthY: 40,
                    argHeights: [20, 20],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 v 2 h 10 v -2 h 78 a 4 4 90 0 1 4 4 v 0 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 4 v 0 v 4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 0 v 0 a 4 4 90 0 1 -4 4 h -69 h -1 v 2 h -8 v -2 h -1 h -4 a 5 5 90 0 0 -5 5 v 32 a 5 5 90 0 0 5 5 h 4 v 2 h 10 v -2 h 4 a 4 4 90 0 1 4 4 v 12 a 4 4 90 0 1 -4 4 h -1 h -12 h -1 v 2 h -8 v -2 h -1 h -4 a 4 4 90 0 1 -4 -4 v -20 v -1 v -32 v -1 v -8 v -20 v -12 z',
                );
            }
        });

        it('generates path with nesting, top instruction notch, and no arguments', () => {
            {
                const { path } = generatePath({
                    hasNest: true,
                    hasNotchArg: false,
                    hasNotchInsTop: true,
                    hasNotchInsBot: false,
                    scale: 1,
                    innerLengthX: 100,
                    nestLengthY: 40,
                    argHeights: [],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 v 2 h 10 v -2 h 78 a 4 4 90 0 1 4 4 v 12 a 4 4 90 0 1 -4 4 h -69 h -1 v 2 h -8 v -2 h -1 h -4 a 5 5 90 0 0 -5 5 v 32 a 5 5 90 0 0 5 5 h 4 v 2 h 10 v -2 h 4 a 4 4 90 0 1 4 4 v 12 a 4 4 90 0 1 -4 4 h -1 h -12 h -10 h -4 a 4 4 90 0 1 -4 -4 v -20 v -1 v -32 v -1 v -8 v -0 v -12 z',
                );
            }
        });

        it('generates path with nesting, top instruction notch, and arguments', () => {
            {
                const { path } = generatePath({
                    hasNest: true,
                    hasNotchArg: false,
                    hasNotchInsTop: true,
                    hasNotchInsBot: false,
                    scale: 1,
                    innerLengthX: 100,
                    nestLengthY: 40,
                    argHeights: [20, 20],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 v 2 h 10 v -2 h 78 a 4 4 90 0 1 4 4 v 0 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 4 v 0 v 4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 0 v 0 a 4 4 90 0 1 -4 4 h -69 h -1 v 2 h -8 v -2 h -1 h -4 a 5 5 90 0 0 -5 5 v 32 a 5 5 90 0 0 5 5 h 4 v 2 h 10 v -2 h 4 a 4 4 90 0 1 4 4 v 12 a 4 4 90 0 1 -4 4 h -1 h -12 h -10 h -4 a 4 4 90 0 1 -4 -4 v -20 v -1 v -32 v -1 v -8 v -20 v -12 z',
                );
            }
        });

        it('generates path with nesting, bottom instruction notch, and no arguments', () => {
            {
                const { path } = generatePath({
                    hasNest: true,
                    hasNotchArg: false,
                    hasNotchInsTop: false,
                    hasNotchInsBot: true,
                    scale: 1,
                    innerLengthX: 100,
                    nestLengthY: 40,
                    argHeights: [],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 h 10 h 78 a 4 4 90 0 1 4 4 v 12 a 4 4 90 0 1 -4 4 h -69 h -1 v 2 h -8 v -2 h -1 h -4 a 5 5 90 0 0 -5 5 v 32 a 5 5 90 0 0 5 5 h 4 v 2 h 10 v -2 h 4 a 4 4 90 0 1 4 4 v 12 a 4 4 90 0 1 -4 4 h -1 h -12 h -1 v 2 h -8 v -2 h -1 h -4 a 4 4 90 0 1 -4 -4 v -20 v -1 v -32 v -1 v -8 v -0 v -12 z',
                );
            }
        });

        it('generates path with nesting, bottom instruction notch, and arguments', () => {
            {
                const { path } = generatePath({
                    hasNest: true,
                    hasNotchArg: false,
                    hasNotchInsTop: false,
                    hasNotchInsBot: true,
                    scale: 1,
                    innerLengthX: 100,
                    nestLengthY: 40,
                    argHeights: [20, 20],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 h 10 h 78 a 4 4 90 0 1 4 4 v 0 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 4 v 0 v 4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 0 v 0 a 4 4 90 0 1 -4 4 h -69 h -1 v 2 h -8 v -2 h -1 h -4 a 5 5 90 0 0 -5 5 v 32 a 5 5 90 0 0 5 5 h 4 v 2 h 10 v -2 h 4 a 4 4 90 0 1 4 4 v 12 a 4 4 90 0 1 -4 4 h -1 h -12 h -1 v 2 h -8 v -2 h -1 h -4 a 4 4 90 0 1 -4 -4 v -20 v -1 v -32 v -1 v -8 v -20 v -12 z',
                );
            }
        });

        it('generates path with nesting, no instruction notch, and no arguments', () => {
            {
                const { path } = generatePath({
                    hasNest: true,
                    hasNotchArg: false,
                    hasNotchInsTop: false,
                    hasNotchInsBot: false,
                    scale: 1,
                    innerLengthX: 100,
                    nestLengthY: 40,
                    argHeights: [],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 h 10 h 78 a 4 4 90 0 1 4 4 v 12 a 4 4 90 0 1 -4 4 h -69 h -1 v 2 h -8 v -2 h -1 h -4 a 5 5 90 0 0 -5 5 v 32 a 5 5 90 0 0 5 5 h 4 v 2 h 10 v -2 h 4 a 4 4 90 0 1 4 4 v 12 a 4 4 90 0 1 -4 4 h -1 h -12 h -10 h -4 a 4 4 90 0 1 -4 -4 v -20 v -1 v -32 v -1 v -8 v -0 v -12 z',
                );
            }
        });

        it('generates path with nesting, no instruction notch, and arguments', () => {
            {
                const { path } = generatePath({
                    hasNest: true,
                    hasNotchArg: false,
                    hasNotchInsTop: false,
                    hasNotchInsBot: false,
                    scale: 1,
                    innerLengthX: 100,
                    nestLengthY: 40,
                    argHeights: [20, 20],
                });
                expect(path).toBe(
                    'm 0.5 4.5 a 4 4 90 0 1 4 -4 h 4 h 10 h 78 a 4 4 90 0 1 4 4 v 0 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 4 v 0 v 4 v 4 h -4 v -3 h -4 v 10 h 4 v -3 h 4 v 4 v 0 v 0 a 4 4 90 0 1 -4 4 h -69 h -1 v 2 h -8 v -2 h -1 h -4 a 5 5 90 0 0 -5 5 v 32 a 5 5 90 0 0 5 5 h 4 v 2 h 10 v -2 h 4 a 4 4 90 0 1 4 4 v 12 a 4 4 90 0 1 -4 4 h -1 h -12 h -10 h -4 a 4 4 90 0 1 -4 -4 v -20 v -1 v -32 v -1 v -8 v -20 v -12 z',
                );
            }
        });
    });

    describe('Bounding Box Calculation', () => {
        it('evaluates brick bounding box for brick with no argument notch', () => {
            const { bBoxBrick } = generatePath({
                hasNest: false,
                hasNotchArg: false,
                hasNotchInsTop: true,
                hasNotchInsBot: true,
                scale: 1,
                innerLengthX: 100,
                argHeights: [],
            });
            expect(bBoxBrick.extent.height).toBe(21);
            expect(bBoxBrick.extent.width).toBe(101);
            expect(bBoxBrick.coords.x).toBe(0);
            expect(bBoxBrick.coords.y).toBe(0);
        });

        it('evaluates brick bounding box for brick with argument notch', () => {
            const { bBoxBrick } = generatePath({
                hasNest: false,
                hasNotchArg: true,
                hasNotchInsTop: false,
                hasNotchInsBot: false,
                scale: 1,
                innerLengthX: 100,
                argHeights: [],
            });
            expect(bBoxBrick.extent.height).toBe(21);
            expect(bBoxBrick.extent.width).toBe(101);
            expect(bBoxBrick.coords.x).toBe(8);
            expect(bBoxBrick.coords.y).toBe(0);
        });

        it('evaluates argument notch bounding box for brick', () => {
            const { bBoxNotchArg } = generatePath({
                hasNest: false,
                hasNotchArg: true,
                hasNotchInsTop: false,
                hasNotchInsBot: false,
                scale: 1,
                innerLengthX: 100,
                argHeights: [],
            });
            expect(bBoxNotchArg?.extent.height).toBe(9);
            expect(bBoxNotchArg?.extent.width).toBe(8);
            expect(bBoxNotchArg?.coords.x).toBe(0);
            expect(bBoxNotchArg?.coords.y).toBe(6);
        });

        it('evaluates top instruction notch bounding box', () => {
            const { bBoxNotchInsTop } = generatePath({
                hasNest: false,
                hasNotchArg: false,
                hasNotchInsTop: true,
                hasNotchInsBot: true,
                scale: 1,
                innerLengthX: 100,
                argHeights: [],
            });
            expect(bBoxNotchInsTop?.extent.height).toBe(2);
            expect(bBoxNotchInsTop?.extent.width).toBe(9);
            expect(bBoxNotchInsTop?.coords.x).toBe(9);
            expect(bBoxNotchInsTop?.coords.y).toBe(0);
        });

        it('evaluates bottom instruction notch bounding box for non-nesting brick', () => {
            const { bBoxNotchInsBot } = generatePath({
                hasNest: false,
                hasNotchArg: false,
                hasNotchInsTop: true,
                hasNotchInsBot: true,
                scale: 1,
                innerLengthX: 100,
                argHeights: [],
            });
            expect(bBoxNotchInsBot?.extent.height).toBe(2);
            expect(bBoxNotchInsBot?.extent.width).toBe(9);
            expect(bBoxNotchInsBot?.coords.x).toBe(9);
            expect(bBoxNotchInsBot?.coords.y).toBe(21);
        });

        it('evaluates bottom instruction notch bounding box for nesting brick', () => {
            const { bBoxNotchInsBot } = generatePath({
                hasNest: true,
                hasNotchArg: false,
                hasNotchInsTop: true,
                hasNotchInsBot: true,
                scale: 1,
                nestLengthY: 30,
                innerLengthX: 100,
                argHeights: [],
            });
            expect(bBoxNotchInsBot?.extent.height).toBe(2);
            expect(bBoxNotchInsBot?.extent.width).toBe(9);
            expect(bBoxNotchInsBot?.coords.x).toBe(9);
            expect(bBoxNotchInsBot?.coords.y).toBe(73);
        });

        it('evaluates inner top instruction notch bounding box for nesting brick', () => {
            const { bBoxNotchInsNestTop } = generatePath({
                hasNest: true,
                hasNotchArg: false,
                hasNotchInsTop: true,
                hasNotchInsBot: true,
                scale: 1,
                nestLengthY: 30,
                innerLengthX: 100,
                argHeights: [],
            });
            expect(bBoxNotchInsNestTop?.extent.height).toBe(2);
            expect(bBoxNotchInsNestTop?.extent.width).toBe(9);
            expect(bBoxNotchInsNestTop?.coords.x).toBe(18);
            expect(bBoxNotchInsNestTop?.coords.y).toBe(21);
        });

        it('evaluates inner top instruction notch bounding box for nesting brick', () => {
            const { bBoxNotchInsNestTop } = generatePath({
                hasNest: true,
                hasNotchArg: false,
                hasNotchInsTop: true,
                hasNotchInsBot: true,
                scale: 1,
                nestLengthY: 30,
                innerLengthX: 100,
                argHeights: [],
            });
            expect(bBoxNotchInsNestTop?.extent.height).toBe(2);
            expect(bBoxNotchInsNestTop?.extent.width).toBe(9);
            expect(bBoxNotchInsNestTop?.coords.x).toBe(18);
            expect(bBoxNotchInsNestTop?.coords.y).toBe(21);
        });

        it('evaluates bounding boxes for arguments', () => {
            const { bBoxArgs } = generatePath({
                hasNest: false,
                hasNotchArg: false,
                hasNotchInsTop: true,
                hasNotchInsBot: true,
                scale: 1,
                innerLengthX: 100,
                argHeights: [17, 30, 40],
            });
            expect(bBoxArgs.extent.height).toBe(9);
            expect(bBoxArgs.extent.width).toBe(8);
            expect(bBoxArgs.coords).toStrictEqual([
                { x: 93, y: 6 },
                { x: 93, y: 26 },
                { x: 93, y: 56 },
            ]);
        });
    });
});
