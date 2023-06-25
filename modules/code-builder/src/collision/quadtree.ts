import Quadtree from 'quadtree-lib';

type Block = { x: number; y: number; ID: string };
class QuadTree {
    private _tree: Quadtree<Block> | null = null;
    private _width: number;
    private _height: number;
    private _maxElements: number;

    constructor() {
        this._width = 0;
        this._height = 0;
        this._maxElements = 4;
        this._tree = null;
    }

    public init() {
        this._tree = new Quadtree({
            width: this._width,
            height: this._height,
            maxElements: this._maxElements,
        });
    }

    public setDimensions(width: number, height: number): void {
        this._width = width;
        this._height = height;
    }

    public setMaxElements(maxElements: number): void {
        this._maxElements = maxElements;
    }

    public addObject(item: Block): void {
        if (this._tree) {
            this._tree.push(item);
        }
    }

    public addObjects(items: Block[]): void {
        if (this._tree) {
            this._tree.pushAll(items);
        }
    }

    public delObject(ID: string): void {
        if (this._tree) {
            const treeNode = this._tree.where({ ID: ID });
            if (treeNode.length > 0) {
                this._tree.remove(treeNode[0]);
            }
        }
    }

    public clear(): void {
        if (this._tree) {
            this._tree.clear();
        }
    }

    public checkCollision(item: Block): Block[] {
        if (this._tree) {
            const collisions = this._tree.colliding(item);
            if (collisions.length > 0) {
                return collisions;
            } else {
                return [];
            }
        }
        return [];
    }
}

export default QuadTree;
