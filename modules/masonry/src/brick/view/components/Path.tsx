import { generateBrickOutline2, type BrickOutlineInput2 } from '../../utils/newPath';

export function PathBrickView({ input }: { input: BrickOutlineInput2 }) {
  const maxArgW = Math.max(0, ...input.paramArgDims.map((p) => p.arg?.w ?? 0));
  const { width, height, path, markers } = generateBrickOutline2(input, true);
  const s = input.strokeWidth ?? 0;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width + maxArgW + s}
      height={height}
      viewBox={`0 0 ${width + maxArgW + s} ${height}`}
      style={{ backgroundColor: '#eee' }}
    >
      {/* Outer brick: grey fill, grey stroke */}
      <path d={path} fill="#bbb" stroke="#555" strokeWidth={s} />

      {markers && (
        <>
          {/* Main label (interior content) */}
          <path d={markers?.labelMain} fill="#00f" />

          {/* Param labels (interior content) */}
          {markers?.labelParams?.map((d, i) => <path key={i} d={d} fill="#ff0" />)}

          {/* Each arg is its own brick: filled with its colour (inside reference) plus a
              darker stroke, so it reads as a distinct brick not overlapping the parent. */}
          {markers?.args?.map((d, i) => (
            <path
              key={i}
              d={d}
              fill={i % 2 === 0 ? '#f80' : '#f0f'}
              stroke={i % 2 === 0 ? '#a50' : '#a0a'}
              strokeWidth={s}
            />
          ))}

          {/* Nested child brick: green fill (inside reference) with a darker green stroke */}
          {markers?.nesting && (
            <path d={markers.nesting} fill="#0f0" stroke="#070" strokeWidth={s} />
          )}
        </>
      )}
    </svg>
  );
}
