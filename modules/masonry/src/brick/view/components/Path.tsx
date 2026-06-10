import type { BrickOutlineInput2 } from '../../../@types/brick';
import { generateBrickOutline2 } from '../../utils/newPath';

export function PathBrickView({ input }: { input: BrickOutlineInput2 }) {
  const maxArgW = Math.max(0, ...input.paramArgDims.map((p) => p.arg?.w ?? 0));
  const { width, height, path, bounds } = generateBrickOutline2(input);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width + maxArgW}
      height={height}
      viewBox={`0 0 ${width + maxArgW} ${height}`}
      style={{ backgroundColor: '#e4e4e4' }}
    >
      <path d={path} fill="#70a1ff" stroke="#3867d6" strokeWidth={input.strokeWidth} />

      {/* Debug overlay: visualises the markers */}
      <>
        {/* Primary label */}
        <rect
          x={bounds.labelMain.x}
          y={bounds.labelMain.y}
          width={bounds.labelMain.w}
          height={bounds.labelMain.h}
          fill="#ffcccc"
        />

        {/* Per-parameter label areas (optional) — one rect per param name slot */}
        {bounds.params?.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill="#ffda79" />
        ))}

        {/* Per-argument slot areas */}
        {bounds.args?.map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            fill={i % 2 === 0 ? '#26de819f' : '#20bf6b9f'}
          />
        ))}

        {/* Nesting (clamp) area — present only on bricks that wrap inner blocks */}
        {bounds.nesting && (
          <rect
            x={bounds.nesting.x}
            y={bounds.nesting.y}
            width={bounds.nesting.w}
            height={bounds.nesting.h}
            fill="#a5b1c27f"
          />
        )}
      </>
    </svg>
  );
}
