import Quadtree from 'quadtree-lib';

class QuadTree {
    private _tree;
    private _width: number;
    private _height: number;
    private _maxElements: number;

    constructor(width: number, height: number, maxElements: number) {
        this._width = width;
        this._height = height;
        this._maxElements = maxElements;
    }

    public init() {
        this._tree = new Quadtree({
            width: this._width,
            height: this._height,
            maxElements: this._maxElements,
        });
    }
}

export default QuadTree;
