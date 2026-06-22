// ── Scale levels ──
export const SCALE_LEVEL_CONFIG = {
    1: {
        brickScale: 0.75,
        minWidth: 80,
        minArgNestHeight: 24,
        minLabelParamHeight: 14,
        fontSize: 12,
        lineHeight: 14,
    },
    2: {
        brickScale: 1,
        minWidth: 100,
        minArgNestHeight: 32,
        minLabelParamHeight: 18,
        fontSize: 14,
        lineHeight: 18,
    },
    3: {
        brickScale: 1.25,
        minWidth: 120,
        minArgNestHeight: 40,
        minLabelParamHeight: 20,
        fontSize: 16,
        lineHeight: 20,
    },
} as const;
