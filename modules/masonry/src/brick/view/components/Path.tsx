import { generateBrickOutline2, type BrickOutlineInput2 } from '../../utils/newPath';

export function PathBrickView({ input }: { input: BrickOutlineInput2 }) {
  const maxArgW = Math.max(0, ...input.paramArgDims.map((p) => p.arg?.w ?? 0));
  const { width, height, path, markers } = generateBrickOutline2(input, true);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width + maxArgW}
      height={height}
      viewBox={`0 0 ${width + maxArgW} ${height}`}
      style={{ backgroundColor: '#eee' }}
    >
      <path d={path} fill="#aaa" />

      {markers && (
        <>
          <path d={markers?.labelMain} fill="#00f" />

          {markers?.labelParams?.map((d, i) => <path key={i} d={d} fill="#ff0" />)}

          {markers?.args?.map((d, i) => (
            <path key={i} d={d} fill={i % 2 === 0 ? '#f80' : '#f0f'} />
          ))}

          <path d={markers?.nesting} fill="#0f0" />
        </>
      )}
    </svg>
  );
}
