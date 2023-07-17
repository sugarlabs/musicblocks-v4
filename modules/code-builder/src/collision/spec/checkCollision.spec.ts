import { checkCollision } from '../utils/index';
import { TCollisionObject } from '@/@types/collision';

describe('checkCollision', () => {
    it('should return true if two circles are colliding', () => {
        const objA = {
            id: 'a',
            x: 0,
            y: 0,
            width: 10,
            height: 10,
        };
        const objB = {
            id: 'b',
            x: 5,
            y: 5,
            width: 10,
            height: 10,
        };

        const result = checkCollision(objA, objB, {
            objType: 'circle',
            colThres: 0,
        });

        expect(result).toBe(true);
    });

    it('should return false if two circles are not colliding', () => {
        const objA = {
            id: 'a',
            x: 0,
            y: 0,
            width: 10,
            height: 10,
        };
        const objB = {
            id: 'b',
            x: 20,
            y: 20,
            width: 10,
            height: 10,
        };

        const result = checkCollision(objA, objB, {
            objType: 'circle',
            colThres: 0,
        });

        expect(result).toBe(false);
    });

    it('should return true if two rectangles are colliding', () => {
        const objA = {
            id: 'a',
            x: 0,
            y: 0,
            width: 10,
            height: 10,
        };
        const objB = {
            id: 'b',
            x: 5,
            y: 5,
            width: 10,
            height: 10,
        };

        const result = checkCollision(objA, objB, {
            objType: 'rect',
            colThres: 0,
        });

        expect(result).toBe(true);
    });

    it('should return false if two rectangles are not colliding', () => {
        const objA = {
            id: 'a',
            x: 0,
            y: 0,
            width: 10,
            height: 10,
        };
        const objB = {
            id: 'b',
            x: 20,
            y: 20,
            width: 10,
            height: 10,
        };

        const result = checkCollision(objA, objB, {
            objType: 'rect',
            colThres: 0,
        });

        expect(result).toBe(false);
    });
});

export { checkCollision };
