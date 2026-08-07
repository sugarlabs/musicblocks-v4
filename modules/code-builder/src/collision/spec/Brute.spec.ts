import CollisionSpaceBrute from '../Brute';

describe('Code Builder: Collision > Space (Brute)', () => {
    let space: CollisionSpaceBrute;

    beforeEach(() => {
        space = new CollisionSpaceBrute(100, 100);
    });

    it('adds objects inside bounds and filters out out-of-bounds ones', () => {
        const inside = { id: 'inside', x: 50, y: 50, width: 10, height: 10 };
        const left = { id: 'left', x: 5, y: 50, width: 10, height: 10 };
        const right = { id: 'right', x: 95, y: 50, width: 10, height: 10 };

        space.addObjects([inside, left, right]);

        const colliding = space.checkCollision({
            id: 'test',
            x: 50,
            y: 50,
            width: 100,
            height: 100,
        });
        expect(colliding).toContain('inside');
        expect(colliding).not.toContain('left');
        expect(colliding).not.toContain('right');
    });

    it('removes objects by ID', () => {
        const obj1 = { id: '1', x: 50, y: 50, width: 10, height: 10 };
        const obj2 = { id: '2', x: 60, y: 60, width: 10, height: 10 };

        space.addObjects([obj1, obj2]);
        space.delObjects([obj1]);

        const colliding = space.checkCollision({
            id: 'test',
            x: 50,
            y: 50,
            width: 100,
            height: 100,
        });
        expect(colliding).toEqual(['2']);
    });

    it('respects collision options and thresholds', () => {
        const obj = { id: '1', x: 50, y: 50, width: 10, height: 10 };
        space.addObjects([obj]);
        space.setOptions({ objType: 'rect', colThres: 0.5 });

        const checkA = { id: 'checkA', x: 54, y: 50, width: 10, height: 10 };
        const checkB = { id: 'checkB', x: 56, y: 50, width: 10, height: 10 };

        expect(space.checkCollision(checkA)).toContain('1');
        expect(space.checkCollision(checkB)).not.toContain('1');
    });

    it('clears all objects on reset', () => {
        const obj = { id: '1', x: 50, y: 50, width: 10, height: 10 };
        space.addObjects([obj]);
        space.reset();

        expect(space.checkCollision(obj)).toEqual([]);
    });
});
