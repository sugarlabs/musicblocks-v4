/**
 * QuadTreeIndex.ts
 *
 * A notch-level spatial index for O(log N) collision detection during drag operations.
 * Instead of indexing brick bounding boxes, this indexes individual notch centroids
 * with metadata (notchType, brickId, towerId) so that drag-time queries can find
 * the nearest compatible connection target directly.
 */

/** The semantic type of a single notch on a brick. */
export type TSingleNotchType = 'insTop' | 'insBot' | 'insNestTop' | 'argLeft' | 'argRight';

/** A single indexed notch entry stored in the QuadTree. */
export interface INotchIndex {
  notchId: string;
  brickId: string;
  towerId: string;
  worldPosition: { x: number; y: number };
  notchType: TSingleNotchType;
}

/**
 * Returns the list of target notch types that are compatible with the given source notch.
 * E.g. a dragged brick's `insBot` (bottom instruction notch) should snap onto an `insTop`.
 */
export function getCompatibleTargets(type: TSingleNotchType): TSingleNotchType[] {
  switch (type) {
    case 'insTop':
      return ['insBot', 'insNestTop'];
    case 'insBot':
      return ['insTop'];
    case 'argLeft':
      return ['argRight'];
    case 'argRight':
      return ['argLeft'];
    case 'insNestTop':
      return ['insTop'];
    default:
      return [];
  }
}

// ── Internal QuadTree primitives ──────────────────────────────────────────────

interface AABB {
  x: number;
  y: number;
  w: number;
  h: number;
}

class QuadNode {
  boundary: AABB;
  capacity: number;
  points: INotchIndex[] = [];
  divided = false;
  ne?: QuadNode;
  nw?: QuadNode;
  se?: QuadNode;
  sw?: QuadNode;

  constructor(boundary: AABB, capacity = 4) {
    this.boundary = boundary;
    this.capacity = capacity;
  }

  contains(pt: INotchIndex): boolean {
    const { x, y } = pt.worldPosition;
    const b = this.boundary;
    return x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h;
  }

  intersects(r: AABB): boolean {
    const b = this.boundary;
    return !(r.x > b.x + b.w || r.x + r.w < b.x || r.y > b.y + b.h || r.y + r.h < b.y);
  }

  subdivide(): void {
    const { x, y, w, h } = this.boundary;
    const hw = w / 2;
    const hh = h / 2;
    this.ne = new QuadNode({ x: x + hw, y, w: hw, h: hh }, this.capacity);
    this.nw = new QuadNode({ x, y, w: hw, h: hh }, this.capacity);
    this.se = new QuadNode({ x: x + hw, y: y + hh, w: hw, h: hh }, this.capacity);
    this.sw = new QuadNode({ x, y: y + hh, w: hw, h: hh }, this.capacity);
    this.divided = true;
  }

  insert(pt: INotchIndex): boolean {
    if (!this.contains(pt)) return false;
    if (this.points.length < this.capacity) {
      this.points.push(pt);
      return true;
    }
    if (!this.divided) this.subdivide();
    return (
      this.ne!.insert(pt) ||
      this.nw!.insert(pt) ||
      this.se!.insert(pt) ||
      this.sw!.insert(pt)
    );
  }

  query(range: AABB, found: INotchIndex[]): void {
    if (!this.intersects(range)) return;
    for (const p of this.points) {
      const { x, y } = p.worldPosition;
      if (
        x >= range.x &&
        x <= range.x + range.w &&
        y >= range.y &&
        y <= range.y + range.h
      ) {
        found.push(p);
      }
    }
    if (this.divided) {
      this.ne!.query(range, found);
      this.nw!.query(range, found);
      this.se!.query(range, found);
      this.sw!.query(range, found);
    }
  }
}

// ── Public QuadTreeIndex ──────────────────────────────────────────────────────

export class QuadTreeIndex {
  private root: QuadNode;
  private collisionThreshold: number;

  /**
   * @param width   Logical width of the workspace.
   * @param height  Logical height of the workspace.
   * @param threshold  Snap radius in px – two notches within this distance are candidates.
   */
  constructor(width: number, height: number, threshold = 20) {
    // Allow negative coords (bricks can be dragged above/left of origin).
    this.root = new QuadNode({ x: -width, y: -height, w: width * 3, h: height * 3 });
    this.collisionThreshold = threshold;
  }

  /** Rebuild the spatial index from scratch (e.g. after tower list changes). */
  public rebuild(width: number, height: number): void {
    this.root = new QuadNode({ x: -width, y: -height, w: width * 3, h: height * 3 });
  }

  /** Bulk-insert an array of notch entries. */
  public insertAll(notches: INotchIndex[]): void {
    for (const notch of notches) {
      this.root.insert(notch);
    }
  }

  /**
   * Find the nearest valid snap target for a given source notch.
   *
   * @param sourceNotch      The dragged brickʼs notch being checked.
   * @param compatibleTypes  Acceptable target notch types (use `getCompatibleTargets`).
   * @param maxRadius        Optional override for the snap threshold.
   * @returns The closest compatible `INotchIndex`, or `null` if none within range.
   */
  public queryNearest(
    sourceNotch: INotchIndex,
    compatibleTypes: TSingleNotchType[],
    maxRadius: number = this.collisionThreshold,
  ): INotchIndex | null {
    const { x, y } = sourceNotch.worldPosition;

    const range: AABB = {
      x: x - maxRadius,
      y: y - maxRadius,
      w: maxRadius * 2,
      h: maxRadius * 2,
    };

    const candidates: INotchIndex[] = [];
    this.root.query(range, candidates);

    let nearestTarget: INotchIndex | null = null;
    let minDistanceSq = Number.MAX_VALUE;

    for (const target of candidates) {
      // 1. Never connect to self (same tower while dragging)
      if (target.towerId === sourceNotch.towerId) continue;

      // 2. Must be a compatible connection type
      if (!compatibleTypes.includes(target.notchType)) continue;

      const dx = target.worldPosition.x - x;
      const dy = target.worldPosition.y - y;
      const distSq = dx * dx + dy * dy;

      if (distSq <= maxRadius * maxRadius && distSq < minDistanceSq) {
        minDistanceSq = distSq;
        nearestTarget = target;
      }
    }

    return nearestTarget;
  }
}
