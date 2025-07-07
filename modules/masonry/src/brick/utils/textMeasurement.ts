/**
 * Text measurement utilities for brick rendering
 */

/**
 * Measure text width and height using canvas API
 */
export function measureTextWidth(text: string, fontSize: number = 16): number {
    // Create a canvas element for text measurement
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    context.font = `${fontSize}px sans-serif`;
    return context.measureText(text).width;
}

/**
 * Fallback for server-side rendering or when canvas is not available
 */
export function estimateTextWidth(text: string): number {
    return Math.max(text.length * 8, 40); // Minimum width of 40
}

/**
 * Get label width with padding, with fallback for SSR
 */
export function getLabelWidth(label: string): number {
    try {
        return measureTextWidth(label, 16) + 8;
    } catch {
        return estimateTextWidth(label);
    }
}

/**
 * Comprehensive label measurement including width, height, ascent, and descent
 */
export function measureLabel(label: string, fontSize: number) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.font = `${fontSize}px sans-serif`;
    const m = ctx.measureText(label);
    const ascent = m.actualBoundingBoxAscent ?? fontSize * 0.8;
    const descent = m.actualBoundingBoxDescent ?? fontSize * 0.2;
    const height = ascent + descent;

    return {
        w: m.width + 8,
        h: height,
        ascent,
        descent,
    };
}
