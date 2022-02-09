/**
 * Converts value in radians to degrees.
 * @param radians - value in radians
 * @returns value in degrees
 */
export function radToDeg(radians: number): number {
    return (radians / Math.PI) * 180;
}

/**
 * Converts value in degrees to radians.
 * @param degrees - value in degrees
 * @returns value in radians
 */
export function degToRad(degrees: number): number {
    return (degrees / 180) * Math.PI;
}
