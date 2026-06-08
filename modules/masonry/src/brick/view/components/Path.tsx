import { generateBrickOutline } from '../../utils/newPath';

export function PathBrickView() {
  const res = generateBrickOutline({
    mainLabel: { w: 60, h: 20 },
    paramLabels: [
      { w: 40, h: 15 },
      { w: 50, h: 15 },
    ],
    args: [
      { w: 100, h: 120 },
      { w: 80, h: 60 },
    ],
    nestings: [{ w: 80, h: 300 }],
  });

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={100} viewBox={`0 0 ${res.width} ${res.height}`}>
      <path d={res.path} fill="#f00" />
    </svg>
  );
}
