import Quadtree from 'quadtree-lib';

export default class QuadTree {
    private _tree: any;

    constructor({ x = 0, y = 0, width, height }) {
        if (!width || !height) throw new Error('Missing quadtree dimensions.');
        this._tree = new Quadtree({ width, height });
    }

    insert(obj) {
        this._tree.insert(obj);
    }

    retrieveCollisions(obj) {
        return this._tree.retrieve(obj);
    }

    query(bounds) {
        return this._tree.retrieve(bounds);
    }
}
