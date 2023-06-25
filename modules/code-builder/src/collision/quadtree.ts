import Quadtree from 'quadtree-lib';

type Block = { x: number; y: number; width: number; height: number };
class QuadTree {
    private _tree: Quadtree<Block> | null = null;
    private _width: number;
    private _height: number;
    private _maxElements: number;

    constructor(width: number, height: number, maxElements: number) {
        this._width = width;
        this._height = height;
        this._maxElements = maxElements;
        this._tree = null;
    }

    public init() {
        this._tree = new Quadtree({
            width: this._width,
            height: this._height,
            maxElements: this._maxElements,
        });
    }

    public push(item: Block) {
        this._tree.push(item);
    }

    public pushAll(items: Block[]) {
        this._tree.pushAll(items);
    }

    public remove(item: Block) {
        this._tree.remove(item);
    }

    public clear() {
        this._tree.clear();
    }
}

export default QuadTree;
