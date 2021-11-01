export function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}

export function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}
