import * as sketchP5 from './sketchP5';

export function mount(container: HTMLElement): void {
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';

    sketchP5.setup(container);

    // dummy button to check functions

    const go = document.createElement('button');
    go.id = 'go';
    go.innerHTML = 'GO';
    go.style.position = 'absolute';
    go.style.right = '0';
    go.style.width = '64px';
    go.style.height = '32px';
    container.appendChild(go);

    go.addEventListener('click', () => {
        sketchP5.setBackground(127);
        sketchP5.setBackground(255, 255, 0);
        sketchP5.setThickness(4);
        sketchP5.setColor(255, 0, 0);
        sketchP5.drawLine(0, 0, 400, 400);
    });
}
