export function loadSVG (element: HTMLDivElement, svgSrc: string) {
  fetch(svgSrc)
  .then((res) => res.text())
  .then((svg) => (element.innerHTML = svg));
};