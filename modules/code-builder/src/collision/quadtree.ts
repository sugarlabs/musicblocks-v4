import Quadtree from 'quadtree-lib';

type Block = { x: number; y: number; ID?: string };

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
    private _tree: Quadtree<Block> | null;
    private _width: number;
    private _height: number;
    private _maxElements: number;
    private _shape: 'circle' | 'square' | null;
    private _radius?: number;
    private _length?: number;
    private _collisionProperties: 'distance' | 'overlap' | null;
    private _thresholdPercent?: number = 5;
    private _thresholdNumber?: number = 10;

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
            let collisions: Block[] = [];
            if (this._collisionProperties === 'distance') {
                collisions = this._tree.colliding(item, (a: Block, b: Block) => {
                    const distanceX = Math.abs(b.x - a.x);
                    const distanceY = Math.abs(b.y - a.y);

                    if (this._radius !== undefined) {
                        const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
                        return distance < (this._thresholdNumber as number);
                    } else if (this._length !== undefined) {
                        const halfWidth1 = this._length / 2;
                        const halfHeight1 = this._length / 2;
                        const halfWidth2 = this._length / 2;
                        const halfHeight2 = this._length / 2;

                        const deltaX = distanceX - halfWidth1 - halfWidth2;
                        const deltaY = distanceY - halfHeight1 - halfHeight2;

                        return (
                            deltaX < (this._thresholdNumber as number) &&
                            deltaY < (this._thresholdNumber as number)
                        );
                    } else {
                        return false;
                    }
                });
            } else if (this._collisionProperties === 'overlap') {
                collisions = this._tree.colliding(item, (a: Block, b: Block) => {
                    if (this._radius !== undefined) {
                        const distance = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

                        if (distance >= (this._radius as number) + (this._radius as number)) {
                            return false;
                        }
                        if (
                            distance <=
                            Math.abs((this._radius as number) - (this._radius as number))
                        ) {
                            return true;
                        }

                        const angle1 = Math.acos(
                            (Math.pow(this._radius as number, 2) +
                                Math.pow(distance, 2) -
                                Math.pow(this._radius as number, 2)) /
                                (2 * (this._radius as number) * distance),
                        );
                        const angle2 = Math.acos(
                            (Math.pow(this._radius as number, 2) +
                                Math.pow(distance, 2) -
                                Math.pow(this._radius as number, 2)) /
                                (2 * (this._radius as number) * distance),
                        );
                        const area1 =
                            (angle1 - Math.sin(angle1)) * Math.pow(this._radius as number, 2);
                        const area2 =
                            (angle2 - Math.sin(angle2)) * Math.pow(this._radius as number, 2);
                        const overlapArea = area1 + area2;

                        const percentage =
                            (overlapArea /
                                Math.min(
                                    Math.PI * Math.pow(this._radius as number, 2),
                                    Math.PI * Math.pow(this._radius as number, 2),
                                )) *
                            100;

                        return percentage > (this._thresholdPercent as number);
                    } else if (this._length) {
                        const xOverlap = Math.max(
                            0,
                            Math.min(a.x + this._length!, b.x + this._length!) - Math.max(a.x, b.x),
                        );
                        const yOverlap = Math.max(
                            0,
                            Math.min(a.y + this._length!, b.y + this._length!) - Math.max(a.y, b.y),
                        );

                        const overlapArea = xOverlap * yOverlap;

                        const area1 = this._length! * this._length!;
                        const area2 = this._length! * this._length!;

                        const percentage = (overlapArea / Math.min(area1, area2)) * 100;

                        return percentage > (this._thresholdPercent as number);
                    } else {
                        return false;
                    }
                });
            }
            return collisions;
        }
        return [];
    }
}

export default QuadTree;
