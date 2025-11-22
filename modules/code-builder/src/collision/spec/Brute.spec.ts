import { describe, it, expect } from 'vitest';
import { CollisionSpaceBrute } from '../index'; // correct import

describe('Brute Collision', () => {
    it('should detect collision when objects overlap', () => {
        const cs = new CollisionSpaceBrute(100, 100);
        cs.addObjects([
            { id: 'a', x: 0, y: 0, width: 10, height: 10 },
            { id: 'b', x: 5, y: 5, width: 10, height: 10 },
        ]);

        const result = cs.checkCollision({ id: 'test', x: 5, y: 5, width: 10, height: 10 });
        expect(result).toContain('a');
        expect(result).toContain('b');
    });

    it('should not detect collision when objects are apart', () => {
        const cs = new CollisionSpaceBrute(100, 100);
        cs.addObjects([{ id: 'a', x: 0, y: 0, width: 10, height: 10 }]);

        const result = cs.checkCollision({ id: 'test', x: 20, y: 20, width: 10, height: 10 });
        expect(result).toHaveLength(0);
    });
});
