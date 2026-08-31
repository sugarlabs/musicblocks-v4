import { useCallback, useEffect, useRef, useState } from 'react';

import type { Point, Size } from '@/@types/common.types';
import type { CollisionObjectShape, CollisionObject } from '@/utils/collision';

import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { BruteForceCollisionSpace, QuadtreeCollisionSpace } from '@/utils/collision';

type ObjectShape = CollisionObjectShape;
type Algorithm = 'brute-force' | 'quadtree';

// Safe as a sentinel: real objects are id'd 1..count in generateObjects, so this never collides.
const CURSOR_OBJECT_ID = 0;

const OBJECT_COUNT_MIN = 20;
const OBJECT_COUNT_MAX = 500;
const OBJECT_SIZE_MIN = 8;
const OBJECT_SIZE_MAX = 32;
const THRESHOLD_MIN = 0;
const THRESHOLD_MAX = 1;

const OBJECT_SHAPE_OPTIONS: { value: ObjectShape; label: string }[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
];

const ALGORITHM_OPTIONS: { value: Algorithm; label: string }[] = [
  { value: 'brute-force', label: 'Brute Force' },
  { value: 'quadtree', label: 'Quadtree' },
];

// Demo-only instrumentation. Both spaces run every candidate check through the protected
// `_collides`, so subclassing and recording each call reveals not just how many comparisons an
// algorithm performs per `checkCollision`, but which objects it compared against - without
// touching the library's collision.ts. Reset `comparedIds` before a `checkCollision`, read after.
// Every `_collides` call pairs the cursor probe with one candidate; we log the candidate's id.
class CountingBruteForceCollisionSpace extends BruteForceCollisionSpace {
  public comparedIds: number[] = [];
  protected override _collides(objA: CollisionObject, objB: CollisionObject): boolean {
    this.comparedIds.push(objA.id === CURSOR_OBJECT_ID ? objB.id : objA.id);
    return super._collides(objA, objB);
  }
}

class CountingQuadtreeCollisionSpace extends QuadtreeCollisionSpace {
  public comparedIds: number[] = [];
  protected override _collides(objA: CollisionObject, objB: CollisionObject): boolean {
    this.comparedIds.push(objA.id === CURSOR_OBJECT_ID ? objB.id : objA.id);
    return super._collides(objA, objB);
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// Always an AABB (square) check, even for circles: it's conservative rather than exact, but a
// non-overlapping bounding box guarantees non-overlapping circles too, so it's safe either way.
function isTooCloseToPlace(x: number, y: number, size: number, other: CollisionObject): boolean {
  return Math.abs(x - other.x) < size && Math.abs(y - other.y) < size;
}

function generateObjects(count: number, size: number, workspace: Size): CollisionObject[] {
  // Margin is pinned to the largest possible object size (not the current one) so that later
  // resizing existing objects in place - up to OBJECT_SIZE_MAX - never pushes them out of bounds.
  const rangeX = Math.max(0, workspace.w - OBJECT_SIZE_MAX * 2);
  const rangeY = Math.max(0, workspace.h - OBJECT_SIZE_MAX * 2);

  const objects: CollisionObject[] = [];

  for (let id = 1; id <= count; id += 1) {
    let placed = false;

    for (let attempt = 0; attempt < 100 && !placed; attempt += 1) {
      const x = OBJECT_SIZE_MAX + Math.random() * rangeX;
      const y = OBJECT_SIZE_MAX + Math.random() * rangeY;

      if (!objects.some((other) => isTooCloseToPlace(x, y, size, other))) {
        objects.push({ id, x, y, w: size, h: size });
        placed = true;
      }
    }

    if (!placed) break;
  }

  return objects;
}

// Paired with `readOnly` on the <Input>: typing is disabled, so the only way to change the
// value is the built-in spinner arrows - each click commits immediately, no buffering needed.
function useNumberField(defaultValue: number, min: number, max: number) {
  const [value, setValue] = useState(defaultValue);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number(e.target.value);
    if (Number.isNaN(parsed)) return;
    setValue(clamp(parsed, min, max));
  };

  return { value, onChange };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
      {label}
      {children}
    </label>
  );
}

// Demo harness for comparing collision-detection algorithms: randomly placed shapes sit in the
// workspace, and the mouse cursor acts as a probe object checked against whichever algorithm
// (brute-force or quadtree) is currently selected.
export default function Collision() {
  const objectCountField = useNumberField(100, OBJECT_COUNT_MIN, OBJECT_COUNT_MAX);
  const objectSizeField = useNumberField(24, OBJECT_SIZE_MIN, OBJECT_SIZE_MAX);
  const thresholdField = useNumberField(0.5, THRESHOLD_MIN, THRESHOLD_MAX);
  const [objectShape, setObjectShape] = useState<ObjectShape>('circle');
  const [algorithm, setAlgorithm] = useState<Algorithm>('brute-force');

  const [objects, setObjects] = useState<CollisionObject[]>([]);
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);
  const [collidingIds, setCollidingIds] = useState<Set<number>>(new Set());

  const [comparedIds, setComparedIds] = useState<number[]>([]);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const bruteForceSpaceRef = useRef<CountingBruteForceCollisionSpace | null>(null);
  const quadtreeSpaceRef = useRef<CountingQuadtreeCollisionSpace | null>(null);

  const getActiveSpace = useCallback(
    () => (algorithm === 'brute-force' ? bruteForceSpaceRef.current : quadtreeSpaceRef.current),
    [algorithm],
  );

  // Created once, using the workspace's size at mount time.
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    bruteForceSpaceRef.current = new CountingBruteForceCollisionSpace(
      workspace.clientWidth,
      workspace.clientHeight,
    );
    quadtreeSpaceRef.current = new CountingQuadtreeCollisionSpace(
      workspace.clientWidth,
      workspace.clientHeight,
    );
  }, []);

  // `objects` holds each object's id, position, and size; shape/threshold stay space-wide,
  // live in the UI controls, and are pushed into the active space via setOptions instead.

  // Read from a ref (rather than a dependency) so that changing the size alone doesn't
  // trigger a reshuffle of existing positions - only the count does.
  const objectSizeRef = useRef(objectSizeField.value);
  objectSizeRef.current = objectSizeField.value;

  const regenerateObjects = useCallback(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    setObjects(
      generateObjects(objectCountField.value, objectSizeRef.current, {
        w: workspace.clientWidth,
        h: workspace.clientHeight,
      }),
    );
  }, [objectCountField.value]);

  useEffect(() => {
    regenerateObjects();
  }, [regenerateObjects]);

  // Object size changed: resize existing objects in place instead of reshuffling positions.
  useEffect(() => {
    setObjects((prev) =>
      prev.map((object) => ({ ...object, w: objectSizeField.value, h: objectSizeField.value })),
    );
  }, [objectSizeField.value]);

  // Combined into one effect (not split by trigger) so reset() can never run after
  // setOptions() has already taken effect.
  useEffect(() => {
    const space = getActiveSpace();
    if (!space) return;

    space.reset();
    space.setOptions({ shape: objectShape, threshold: thresholdField.value });
    space.createObjects(objects);
  }, [getActiveSpace, objects, objectShape, thresholdField.value]);

  const handleRefresh = () => {
    regenerateObjects();
  };

  const handleWorkspacePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    const rect = workspace.getBoundingClientRect();
    const size = objectSizeField.value;

    // Unlike generateObjects, this margin uses the current size, not OBJECT_SIZE_MAX: the
    // cursor is recalculated on every move, so there's no stored position to overflow later.
    const x = clamp(e.clientX - rect.left, size / 2, Math.max(size / 2, rect.width - size / 2));
    const y = clamp(e.clientY - rect.top, size / 2, Math.max(size / 2, rect.height - size / 2));

    setCursorPosition({ x, y });

    const space = getActiveSpace();
    if (space) {
      space.comparedIds = [];
      const hits = space.checkCollision({ id: CURSOR_OBJECT_ID, x, y, w: size, h: size });
      setCollidingIds(new Set(hits));
      setComparedIds(space.comparedIds);
    }
  };

  const handleWorkspacePointerLeave = () => {
    setCursorPosition(null);
    setCollidingIds(new Set());
    setComparedIds([]);
  };

  // Lets the line overlay resolve each compared id back to the object's live position.
  const objectsById = new Map(objects.map((object) => [object.id, object]));

  // A set rather than the raw array: the object list tests membership once per object, which
  // would otherwise be a linear scan of every comparison the algorithm just made.
  const comparedIdSet = new Set(comparedIds);

  return (
    <div className="h-full w-full bg-indigo-100 p-2">
      <div className="flex h-full w-full flex-row rounded-lg bg-white">
        <div className="flex w-56 flex-none flex-col gap-4 border-r border-slate-200 p-4">
          <Field label="Object Count">
            <Input
              type="number"
              className="w-full"
              min={OBJECT_COUNT_MIN}
              max={OBJECT_COUNT_MAX}
              step={10}
              value={objectCountField.value}
              onChange={objectCountField.onChange}
              readOnly
            />
          </Field>

          <Field label="Object Size">
            <Input
              type="number"
              className="w-full"
              min={OBJECT_SIZE_MIN}
              max={OBJECT_SIZE_MAX}
              step={4}
              value={objectSizeField.value}
              onChange={objectSizeField.onChange}
              readOnly
            />
          </Field>

          <Field label="Object Shape">
            <Select
              items={OBJECT_SHAPE_OPTIONS}
              value={objectShape}
              onValueChange={(value) => setObjectShape(value as ObjectShape)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {OBJECT_SHAPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Threshold">
            <Input
              type="number"
              className="w-full"
              min={THRESHOLD_MIN}
              max={THRESHOLD_MAX}
              step={0.1}
              value={thresholdField.value}
              onChange={thresholdField.onChange}
              readOnly
            />
          </Field>

          <Field label="Algorithm">
            <Select
              items={ALGORITHM_OPTIONS}
              value={algorithm}
              onValueChange={(value) => setAlgorithm(value as Algorithm)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {ALGORITHM_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Button onClick={handleRefresh}>Refresh</Button>

          <div className="mt-2 flex flex-col gap-1 border-t border-slate-200 pt-3">
            <span className="text-xs font-medium text-slate-600">Comparisons / move</span>
            <span className="font-mono text-2xl leading-none font-semibold text-indigo-600">
              {cursorPosition ? comparedIds.length : '—'}
            </span>
          </div>
        </div>

        <div
          ref={workspaceRef}
          className="relative h-full flex-1 overflow-hidden"
          onMouseMove={handleWorkspacePointerMove}
          onMouseLeave={handleWorkspacePointerLeave}
        >
          {/* One line from the cursor to every object the active algorithm compared against
              this move. Brute Force fans out to all objects; Quadtree only to nearby candidates.
              Rendered first so the lines sit beneath the shapes. */}
          {cursorPosition && (
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              {comparedIds.map((id) => {
                const target = objectsById.get(id);
                if (!target) return null;

                return (
                  <line
                    key={id}
                    x1={cursorPosition.x}
                    y1={cursorPosition.y}
                    x2={target.x}
                    y2={target.y}
                    // Same hue family as the object at the far end, so a line and the brick it
                    // points at read as one thing: amber for a hit, orange for a plain check.
                    stroke={collidingIds.has(id) ? '#f59e0b' : '#fed7aa'}
                    strokeWidth={1}
                  />
                );
              })}
            </svg>
          )}

          {objects.map((object) => {
            const isColliding = collidingIds.has(object.id);
            // The far end of a line: the algorithm checked this object but it wasn't a hit.
            // Colouring it makes the checked set readable without tracing every line back.
            const isCompared = !isColliding && comparedIdSet.has(object.id);

            return (
              <div
                key={object.id}
                className={cn(
                  'absolute top-0 left-0 box-border flex items-center justify-center border-2',
                  objectShape === 'circle' && 'rounded-full',
                  isColliding && 'border-amber-600 bg-amber-500',
                  isCompared && 'border-orange-400',
                  !isColliding && !isCompared && 'border-indigo-600',
                )}
                style={{
                  width: object.w,
                  height: object.h,
                  transform: `translate(${object.x - object.w / 2}px, ${
                    object.y - object.h / 2
                  }px)`,
                }}
              >
                <span
                  className={cn(
                    'rounded-sm bg-white px-0.5 text-[8px] leading-none font-medium',
                    isColliding && 'text-amber-600',
                    isCompared && 'text-orange-400',
                    !isColliding && !isCompared && 'text-indigo-600',
                  )}
                >
                  {object.id}
                </span>
              </div>
            );
          })}

          {cursorPosition && (
            // Not part of `objects`, so its size comes straight from the control instead of
            // an object's own w/h.
            <div
              className={cn(
                'absolute top-0 left-0 z-10 box-border border-2 border-red-600',
                objectShape === 'circle' && 'rounded-full',
              )}
              style={{
                width: objectSizeField.value,
                height: objectSizeField.value,
                transform: `translate(${cursorPosition.x - objectSizeField.value / 2}px, ${
                  cursorPosition.y - objectSizeField.value / 2
                }px)`,
                willChange: 'transform',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
