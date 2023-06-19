import p5 from 'p5';

/**
 * Sets up a canvas with a cartesian grid.
 * @param container DOM container of the grid
 */
export function setupCartesian(container: HTMLElement): void {
    const { width, height } = container.getBoundingClientRect();

    new p5((p: p5) => {
        p.setup = () => {
            p.createCanvas(width, height);
            p.noLoop();

            let delta = 10;
            let piecesVer = Math.floor((p.width >> 1) / delta);
            let piecesHor = Math.floor((p.height >> 1) / delta);

            p.stroke(252, 252, 252);
            p.strokeWeight(1);
            for (let i = 1; i <= piecesVer; i++) {
                p.line((p.width >> 1) + i * delta, 0, (p.width >> 1) + i * delta, p.height);
                p.line((p.width >> 1) - i * delta, 0, (p.width >> 1) - i * delta, p.height);
            }
            for (let i = 1; i <= piecesHor; i++) {
                p.line(0, (p.height >> 1) + i * delta, p.width, (p.height >> 1) + i * delta);
                p.line(0, (p.height >> 1) - i * delta, p.width, (p.height >> 1) - i * delta);
            }

            delta = 100;
            piecesVer = Math.floor((p.width >> 1) / delta);
            piecesHor = Math.floor((p.height >> 1) / delta);

            p.stroke(244, 244, 244);
            p.strokeWeight(1);
            for (let i = 1; i <= piecesVer; i++) {
                p.line((p.width >> 1) + i * delta, 0, (p.width >> 1) + i * delta, p.height);
                p.line((p.width >> 1) - i * delta, 0, (p.width >> 1) - i * delta, p.height);
            }
            for (let i = 1; i <= piecesHor; i++) {
                p.line(0, (p.height >> 1) + i * delta, p.width, (p.height >> 1) + i * delta);
                p.line(0, (p.height >> 1) - i * delta, p.width, (p.height >> 1) - i * delta);
            }

            p.stroke(240, 240, 240);
            p.strokeWeight(2);
            p.line(p.width >> 1, 0, p.width >> 1, p.height);
            p.line(0, p.height >> 1, p.width, p.height >> 1);
        };
    }, container);
}
