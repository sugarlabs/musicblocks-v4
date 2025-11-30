// import type { TCollisionObject } from '@/@types/collision';

// function _checkCollisionCircle(
//     objA: TCollisionObject,
//     objB: TCollisionObject,
//     threshold: number,
// ): boolean {
//     // width should be equal to height though
//     const sizeObjA = Math.min(objA.width, objA.height);
//     const sizeObjB = Math.min(objB.width, objB.height);

//     const distance = Math.sqrt(Math.pow(objA.x - objB.x, 2) + Math.pow(objA.y - objB.y, 2));

//     return (
//         distance < ((sizeObjA >> 1) + (sizeObjB >> 1)) * (1 - Math.max(0, Math.min(1, threshold)))
//     );
// }

// function _checkCollisionRect(
//     objA: TCollisionObject,
//     objB: TCollisionObject,
//     threshold: number,
// ): boolean {
//     const [ax1, ax2, ax3, ax4] = [
//         objA.x - (objA.width >> 1),
//         objA.x + (objA.width >> 1),
//         objA.x - (objA.width >> 1),
//         objA.x + (objA.width >> 1),
//     ];
//     const [ay1, ay2, ay3, ay4] = [
//         objA.y - (objA.height >> 1),
//         objA.y - (objA.height >> 1),
//         objA.y + (objA.height >> 1),
//         objA.y + (objA.height >> 1),
//     ];
//     const [bx1, bx2, bx3, bx4] = [
//         objB.x - (objB.width >> 1),
//         objB.x + (objB.width >> 1),
//         objB.x - (objB.width >> 1),
//         objB.x + (objB.width >> 1),
//     ];
//     const [by1, by2, by3, by4] = [
//         objB.y - (objB.height >> 1),
//         objB.y - (objB.height >> 1),
//         objB.y + (objB.height >> 1),
//         objB.y + (objB.height >> 1),
//     ];

//     const [cx1, cx2, cx3, cx4] = [
//         Math.max(ax1, bx1),
//         Math.min(ax2, bx2),
//         Math.max(ax3, bx3),
//         Math.min(ax4, bx4),
//     ];
//     const [cy1, cy2, cy3, cy4] = [
//         Math.max(ay1, by1),
//         Math.max(ay2, by2),
//         Math.min(ay3, by3),
//         Math.min(ay4, by4),
//     ];

//     if (cx1 < cx2 && cx3 < cx4 && cy1 < cy3 && cy2 < cy4) {
//         const areaA = (ax2 - ax1) * (ay3 - ay1);
//         const areaB = (bx2 - bx1) * (by3 - by1);
//         const areaC = (cx2 - cx1) * (cy3 - cy1);

//         return areaC > Math.min(areaA, areaB) * Math.max(0, Math.min(1, threshold));
//     }

//     return false;
// }

// /**
//  * Checks whether two objects are colliding
//  * @param objA object 1
//  * @param objB object 2
//  * @param options collision properties
//  */
// export function checkCollision(
//     objA: TCollisionObject,
//     objB: TCollisionObject,
//     options: {
//         objType: 'circle' | 'rect';
//         colThres: number;
//     },
// ): boolean {
//     const { objType, colThres } = options;

//     return (objType === 'circle' ? _checkCollisionCircle : _checkCollisionRect)(
//         objA,
//         objB,
//         colThres,
//     );
// }

/* File: src/collision/utils.ts */
import type { TCollisionObject } from '@/@types/collision';

/**
 * Checks collision between two circles
 */
function _checkCollisionCircle(
    objA: TCollisionObject,
    objB: TCollisionObject,
    threshold: number,
): boolean {
    const radiusA = Math.min(objA.width, objA.height) / 2;
    const radiusB = Math.min(objB.width, objB.height) / 2;

    const dx = objA.x - objB.x;
    const dy = objA.y - objB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < (radiusA + radiusB) * (1 - Math.max(0, Math.min(1, threshold)));
}

/**
 * Checks collision between two rectangles (Axis-Aligned Bounding Box)
 */
function _checkCollisionRect(
    objA: TCollisionObject,
    objB: TCollisionObject,
    threshold: number,
): boolean {
    const halfWidthA = objA.width / 2;
    const halfHeightA = objA.height / 2;
    const halfWidthB = objB.width / 2;
    const halfHeightB = objB.height / 2;

    const leftA = objA.x - halfWidthA;
    const rightA = objA.x + halfWidthA;
    const topA = objA.y - halfHeightA;
    const bottomA = objA.y + halfHeightA;

    const leftB = objB.x - halfWidthB;
    const rightB = objB.x + halfWidthB;
    const topB = objB.y - halfHeightB;
    const bottomB = objB.y + halfHeightB;

    const overlapX = rightA - leftB > 0 && rightB - leftA > 0;
    const overlapY = bottomA - topB > 0 && bottomB - topA > 0;

    return overlapX && overlapY;
}

/**
 * Checks whether two objects are colliding
 */
export function checkCollision(
    objA: TCollisionObject,
    objB: TCollisionObject,
    options: { objType: 'circle' | 'rect'; colThres: number },
): boolean {
    return options.objType === 'circle'
        ? _checkCollisionCircle(objA, objB, options.colThres)
        : _checkCollisionRect(objA, objB, options.colThres);
}
