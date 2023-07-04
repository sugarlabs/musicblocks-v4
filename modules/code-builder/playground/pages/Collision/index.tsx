import { useEffect, useRef, useState } from 'react';
import { CollisionSpaceBrute, CollisionSpaceQuadTree } from '@/collision';
import './index.scss';

type TObjType = 'circle' | 'rect';
type TColAlgo = 'brute' | 'quadtree';

const OBJCOUNT = 100;
const OBJSIZE = 32;
const OBJTYPE: TObjType = 'circle';
const COLTHRES = 0;
const COLALGO: TColAlgo = 'brute';

export default function (): JSX.Element {
  const [objCount, setObjCount] = useState(OBJCOUNT);
  const [objSize, setObjSize] = useState(OBJSIZE);
  const [objType, setObjType] = useState<TObjType>(OBJTYPE);
  const [colThres, setColThres] = useState(COLTHRES);
  const [colAlgo, setColAlgo] = useState<TColAlgo>(COLALGO);
  const [resetC, setResetC] = useState(0);

  const [objects, setObjects] = useState<{ id: string; x: number; y: number; active: boolean }[]>(
    [],
  );
  const [target, setTarget] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const colSpaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const colSpace = colSpaceRef.current!;
    const { width, height, left, top } = colSpace.getBoundingClientRect();

    const objects = [...new Array(objCount).keys()].map((i) => ({
      id: `col-${i}`,
      x: objSize / 2 + Math.floor(Math.random() * (width - objSize)),
      y: objSize / 2 + Math.floor(Math.random() * (height - objSize)),
      width: objSize,
      height: objSize,
    }));

    const CollisionSpace = colAlgo === 'brute' ? CollisionSpaceBrute : CollisionSpaceQuadTree;
    const colSpaceModel = new CollisionSpace(width, height);
    colSpaceModel.setOptions({ objType, colThres });
    colSpaceModel.addObjects([...objects]);

    setObjects(objects.map((object) => ({ ...object, active: false })));
    setTarget({ x: width / 2, y: height / 2 });

    function handlerMouseMove(e: MouseEvent) {
      const x = e.x - left;
      const y = e.y - top;

      if (
        !(
          x > objSize / 2 &&
          x < left + width - objSize / 2 &&
          y > objSize / 2 &&
          y < top + height - objSize / 2
        )
      )
        return;

      setTarget({ x, y });

      const colliding = colSpaceModel.checkCollision({
        x,
        y,
        width: objSize,
        height: objSize,
        id: 'col-target',
      });
      setObjects((objects) =>
        objects.map((object) => ({ ...object, active: colliding.includes(object.id) })),
      );
    }

    colSpace.addEventListener('mousemove', handlerMouseMove);

    return () => {
      colSpace.removeEventListener('mousemove', handlerMouseMove);
    };
  }, [objCount, objSize, objType, colThres, colAlgo, resetC]);

  return (
    <div id="collision-space-wrapper">
      <ul id="collision-space-controls">
        <li className="collision-space-control">
          <label>Object Count</label>
          <input
            type="number"
            min={50}
            max={500}
            step={10}
            value={objCount}
            onChange={(e) => setObjCount(Number(e.target.value))}
          />
        </li>
        <li className="collision-space-control">
          <label>Object Size</label>
          <input
            type="number"
            min={16}
            max={64}
            step={4}
            value={objSize}
            onChange={(e) => setObjSize(Number(e.target.value))}
          />
        </li>
        <li className="collision-space-control">
          <label>Object Shape</label>
          <select value={objType} onChange={(e) => setObjType(e.target.value as TObjType)}>
            <option value="circle">Circle</option>
            <option value="rect">Square</option>
          </select>
        </li>
        <li className="collision-space-control">
          <label>Threshold</label>
          <input
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={colThres}
            onChange={(e) => setColThres(Number(e.target.value))}
          />
        </li>
        <li className="collision-space-control">
          <label>Algorithm</label>
          <select value={colAlgo} onChange={(e) => setColAlgo(e.target.value as TColAlgo)}>
            <option value="brute">Brute</option>
            <option value="quadtree">Quadtree</option>
          </select>
        </li>
        <li className="collision-space-control">
          <button onClick={() => setResetC((resetC) => resetC + 1)}>Reset</button>
        </li>
      </ul>

      <div id="collision-space" ref={colSpaceRef}>
        {objects.map(({ id, x, y, active }, i) => (
          <div
            className={[
              'collision-space-object',
              active ? 'collision-space-object-active' : '',
            ].join(' ')}
            key={`collision-space-object-${i}`}
            id={id}
            style={{
              width: `${objSize}px`,
              height: `${objSize}px`,
              borderRadius: objType === 'circle' ? '50%' : 0,
              transform: `translate(${x - objSize / 2}px, ${y - objSize / 2}px)`,
            }}
          ></div>
        ))}
        <div
          className="collision-space-object collision-space-object-target"
          style={{
            width: `${objSize}px`,
            height: `${objSize}px`,
            borderRadius: objType === 'circle' ? '50%' : 0,
            transform: `translate(${target.x - objSize / 2}px, ${target.y - objSize / 2}px)`,
          }}
        ></div>
      </div>
    </div>
  );
}
