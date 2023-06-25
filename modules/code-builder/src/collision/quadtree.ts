import Quadtree from 'quadtree-lib';

type Block = { x: number; y: number; ID: string };
type options =
    | {
          type: 'circle';
          radius: number;
          collisionProperties: 'distance' | 'overlap';
      }
    | {
          type: 'square';
          length: number;
          collisionProperties: 'distance' | 'overlap';
      };
class QuadTree {
    private _tree: Quadtree<Block> | null = null;
    private _width: number;
    private _height: number;
    private _maxElements: number;
    private _shape: 'circle' | 'square' | null;
    private _radius?: number;
    private _length?: number;
    private _collisionProperties: 'distance' | 'overlap' | null;

    constructor() {
        this._width = 0;
        this._height = 0;
        this._maxElements = 4;
        this._tree = null;
        this._shape = null;
        this._radius = undefined;
        this._length = undefined;
        this._collisionProperties = null;
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

    public setOptions(options: options): void {
        if (this._tree) {
            this._shape = options.type;
            this._collisionProperties = options.collisionProperties;
            if (options.type === 'circle') {
                this._radius = options.radius;
            }
            if (options.type === 'square') {
                this._length = options.length;
            }
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
