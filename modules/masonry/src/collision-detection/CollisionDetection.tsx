import React, { useState, useEffect, useRef } from 'react';

type Algo = 'brute' | 'quadtree';
type Shape = 'circle' | 'rect';

interface Obj {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}
type Input = Omit<Obj, 'active'>;

/** ── Brute‐force: O(N²) collision ─────────────────────── */
export class CollisionSpaceBrute {
  private objects: Input[] = [];
  private factor = 1;
  setOptions(opts: { threshold: number }) {
    this.factor = 1 + opts.threshold;
  }
  addObjects(objs: Input[]) {
    this.objects = objs.slice();
  }
  checkCollision(q: Input): string[] {
    const hits: string[] = [];
    const rQ = (q.width / 2) * this.factor;
    for (const o of this.objects) {
      if (o.id === q.id) continue;
      const rO = (o.width / 2) * this.factor;
      const dx = o.x - q.x,
        dy = o.y - q.y;
      if (dx * dx + dy * dy <= (rQ + rO) ** 2) {
        hits.push(o.id);
      }
    }
    return hits;
  }
}

/** ── Quadtree: O(N log N) build + O(log N + k) queries ─ */
interface AABB {
  x: number;
  y: number;
  w: number;
  h: number;
}
class QuadNode {
  boundary: AABB;
  capacity: number;
  points: Input[] = [];
  divided = false;
  ne?: QuadNode;
  nw?: QuadNode;
  se?: QuadNode;
  sw?: QuadNode;

  constructor(boundary: AABB, capacity = 4) {
    this.boundary = boundary;
    this.capacity = capacity;
  }
  contains(pt: Input) {
    const b = this.boundary;
    return pt.x >= b.x && pt.x < b.x + b.w && pt.y >= b.y && pt.y < b.h + b.y;
  }
  intersects(r: AABB) {
    const b = this.boundary;
    return !(r.x > b.x + b.w || r.x + r.w < b.x || r.y > b.y + b.h || r.y + r.h < b.y);
  }
  subdivide() {
    const { x, y, w, h } = this.boundary;
    const hw = w / 2,
      hh = h / 2;
    this.ne = new QuadNode({ x: x + hw, y, w: hw, h: hh }, this.capacity);
    this.nw = new QuadNode({ x, y, w: hw, h: hh }, this.capacity);
    this.se = new QuadNode({ x: x + hw, y: y + hh, w: hw, h: hh }, this.capacity);
    this.sw = new QuadNode({ x, y: y + hh, w: hw, h: hh }, this.capacity);
    this.divided = true;
  }
  insert(pt: Input): boolean {
    if (!this.contains(pt)) return false;
    if (this.points.length < this.capacity) {
      this.points.push(pt);
      return true;
    }
    if (!this.divided) this.subdivide();
    return this.ne!.insert(pt) || this.nw!.insert(pt) || this.se!.insert(pt) || this.sw!.insert(pt);
  }
  query(range: AABB, found: Input[]) {
    if (!this.intersects(range)) return;
    for (const p of this.points) {
      if (p.x >= range.x && p.x <= range.x + range.w && p.y >= range.y && p.y <= range.y + range.h)
        found.push(p);
    }
    if (this.divided) {
      this.ne!.query(range, found);
      this.nw!.query(range, found);
      this.se!.query(range, found);
      this.sw!.query(range, found);
    }
  }
}
export class CollisionSpaceQuadTree {
  private root: QuadNode;
  private factor = 1;
  constructor(width: number, height: number) {
    this.root = new QuadNode({ x: 0, y: 0, w: width, h: height });
  }
  setOptions(opts: { threshold: number }) {
    this.factor = 1 + opts.threshold;
  }
  addObjects(objs: Input[]) {
    const { w, h } = this.root.boundary;
    this.root = new QuadNode({ x: 0, y: 0, w, h });
    for (const o of objs) this.root.insert(o);
  }
  checkCollision(q: Input): string[] {
    const hits: string[] = [];
    const rQ = (q.width / 2) * this.factor;
    const half = rQ * 2;
    const range: AABB = {
      x: q.x - half,
      y: q.y - half,
      w: 2 * half,
      h: 2 * half,
    };
    const candidates: Input[] = [];
    this.root.query(range, candidates);
    for (const o of candidates) {
      if (o.id === q.id) continue;
      const rO = (o.width / 2) * this.factor;
      const dx = o.x - q.x,
        dy = o.y - q.y;
      if (dx * dx + dy * dy <= (rQ + rO) ** 2) hits.push(o.id);
    }
    return hits;
  }
}

/** ── React Collision Map ─────────────────────────────── */
export default function CollisionDetection() {
  const [count, setCount] = useState(100);
  const [size, setSize] = useState(32);
  const [shape, setShape] = useState<Shape>('circle');
  const [threshold, setThreshold] = useState(0);
  const [algo, setAlgo] = useState<Algo>('brute');
  const [resetKey, setResetKey] = useState(0);

  // state + refs
  const [objects, setObjects] = useState<Obj[]>([]);
  const engineRef = useRef<CollisionSpaceBrute | CollisionSpaceQuadTree | null>(null);
  const inputsRef = useRef<Input[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  // (re)build engine + random objects on resetKey or control change
  useEffect(() => {
    const generateObjects = () => {
      // Use fixed dimensions for the container
      const width = 800;
      const height = 600;

      // scatter N inputs with proper bounds
      const inputs: Input[] = Array.from({ length: count }, (_, i) => ({
        id: `obj-${i}`,
        x: size / 2 + Math.random() * (width - size),
        y: size / 2 + Math.random() * (height - size),
        width: size,
        height: size,
      }));
      inputsRef.current = inputs;

      // instantiate engine
      const Engine = algo === 'brute' ? CollisionSpaceBrute : CollisionSpaceQuadTree;
      const eng = new Engine(width, height);
      eng.setOptions({ threshold });
      eng.addObjects(inputs);
      engineRef.current = eng;

      // reset all to inactive
      setObjects(inputs.map((i) => ({ ...i, active: false })));
    };

    generateObjects();
  }, [count, size, shape, threshold, algo, resetKey]);

  // on-hover: recompute only for the hovered item
  function handleMouseEnter(id: string) {
    const eng = engineRef.current!;
    const allInputs = inputsRef.current;
    const target = allInputs.find((o) => o.id === id)!;
    const hits = eng.checkCollision(target);
    const activeSet = new Set<string>(hits);

    setObjects(
      allInputs.map((o) => ({
        ...o,
        active: activeSet.has(o.id),
      })),
    );
  }
  function handleMouseLeave() {
    setObjects(inputsRef.current.map((o) => ({ ...o, active: false })));
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '8px',
        }}
      >
        <div>
          <label htmlFor="count" style={{ marginRight: '8px', fontWeight: 'bold' }}>
            Count:
          </label>
          <input
            id="count"
            type="number"
            min={10}
            max={500}
            step={10}
            value={count}
            onChange={(e) => setCount(+e.target.value)}
            style={{ width: '80px', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label htmlFor="size" style={{ marginRight: '8px', fontWeight: 'bold' }}>
            Size:
          </label>
          <input
            id="size"
            type="number"
            min={8}
            max={128}
            step={4}
            value={size}
            onChange={(e) => setSize(+e.target.value)}
            style={{ width: '80px', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label htmlFor="shape" style={{ marginRight: '8px', fontWeight: 'bold' }}>
            Shape:
          </label>
          <select
            id="shape"
            value={shape}
            onChange={(e) => setShape(e.target.value as Shape)}
            style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="circle">Circle</option>
            <option value="rect">Square</option>
          </select>
        </div>
        <div>
          <label htmlFor="threshold" style={{ marginRight: '8px', fontWeight: 'bold' }}>
            Threshold:
          </label>
          <input
            id="threshold"
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={threshold}
            onChange={(e) => setThreshold(+e.target.value)}
            style={{ width: '80px', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label htmlFor="algo" style={{ marginRight: '8px', fontWeight: 'bold' }}>
            Algorithm:
          </label>
          <select
            id="algo"
            value={algo}
            onChange={(e) => setAlgo(e.target.value as Algo)}
            style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="brute">Brute-Force O(N²)</option>
            <option value="quadtree">QuadTree O(N log N)</option>
          </select>
        </div>
        <button
          onClick={() => setResetKey((k) => k + 1)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      <div
        ref={wrapRef}
        style={{
          position: 'relative',
          width: '800px',
          height: '600px',
          backgroundColor: '#ffffff',
          border: '2px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
          margin: '0 auto',
        }}
      >
        {objects.map((o) => (
          <div
            key={o.id}
            style={{
              position: 'absolute',
              width: `${o.width}px`,
              height: `${o.height}px`,
              backgroundColor: o.active ? '#ff4444' : '#4488ff',
              border: `2px solid ${o.active ? '#cc0000' : '#0066cc'}`,
              borderRadius: shape === 'circle' ? '50%' : '4px',
              transform: `translate(${o.x - o.width / 2}px, ${o.y - o.height / 2}px)`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              zIndex: o.active ? 10 : 1,
            }}
            onMouseEnter={() => handleMouseEnter(o.id)}
            onMouseLeave={handleMouseLeave}
            title={`${o.id}`}
          />
        ))}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>
          <strong>Instructions:</strong> Hover over any object to highlight only the objects that
          are colliding with it in red.
        </p>
        <p>
          <strong>Algorithm:</strong> Currently using{' '}
          {algo === 'brute' ? 'Brute-Force O(N²)' : 'QuadTree O(N log N)'} collision detection.
        </p>
      </div>
    </div>
  );
}
