import p5 from 'p5';

// -------------------------------------------------------------------------------------------------

/** p5 sketch instance. */
let sketch: p5;

/**
 * Initializes a p5 instance and sets it up inside provided DOM element.
 * @param container - DOM element which will contain the p5 canvas.
 */
export function setup(container: HTMLElement): void {
    const { width, height } = container.getBoundingClientRect();

    new p5((p: p5) => {
        sketch = p;

        p.setup = () => {
            p.createCanvas(width, height);
            p.noLoop();
            p.translate(p.width / 2, p.height / 2);
            p.angleMode(p.DEGREES);
            p.scale(1, -1);
        };
    }, container);
}

/**
 * Draws a straight line.
 * @param x1 - x co-ordinate of point 1
 * @param y1 - y co-ordinate of point 1
 * @param x2 - x co-ordinate of point 2
 * @param y2 - y co-ordinate of point 2
 */
export function drawLine(x1: number, y1: number, x2: number, y2: number): void {
    sketch.line(x1, y1, x2, y2);
}

/**
 * Draws a point.
 * @param x - x co-ordinate of the point
 * @param y - y co-ordinate of the point
 */
export function drawPoint(x: number, y: number): void {
    sketch.point(x, y);
}

/**
 * Draws an arc.
 * @param x - x co-ordinate of arc's ellipse
 * @param y - y co-ordinate of arc's ellipse
 * @param w - width of arc's ellipse
 * @param h - height of arc's ellipse
 * @param start - angle to start the arc - in Radians
 * @param stop - angle to stop the arc - in Radians
 */
export function drawArc(
    x: number,
    y: number,
    w: number,
    h: number,
    start: number,
    stop: number,
): void {
    sketch.noFill();
    sketch.arc(x, y, w, h, start, stop, sketch.OPEN);
}

/**
 * Draws a bezier curve.
 * @param x1 - x co-ordinate of anchor point 1
 * @param y1 - y co-ordinate of anchor point 1
 * @param x2 - x co-ordinate of control point 1
 * @param y2 - y co-ordinate of control point 1
 * @param x3 - x co-ordinate of control point 2
 * @param y3 - y co-ordinate of control point 2
 * @param x4 - x co-ordinate of anchor point 2
 * @param y4 - y co-ordinate of anchor point 2
 */
export function drawBezier(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number,
): void {
    sketch.bezier(x1, y1, x2, y2, x3, y3, x4, y4);
}

/**
 * Sets fill color.
 * @param value - greyscale value
 */
export function setFillOn(value: number): void;
/**
 * Sets fill color.
 * @param v1 - red channel value
 * @param v2 - green channel value
 * @param v3 - blue channel value
 */
export function setFillOn(v1: number, v2?: number, v3?: number): void;
export function setFillOn(v1: number, v2?: number, v3?: number): void {
    if (typeof v2 === 'number' && typeof v3 === 'number') {
        sketch.fill(v1, v2, v3);
    } else {
        sketch.fill(v1);
    }
}

/**
 * Clears the fill color.
 */
export function setFillOff(): void {
    sketch.noFill();
}

/**
 * Sets drawing color.
 * @param value - greyscale value
 */
export function setColor(value: number): void;
/**
 * Sets drawing color.
 * @param v1 - red channel value
 * @param v2 - green channel value
 * @param v3 - blue channel value
 */
export function setColor(v1: number, v2?: number, v3?: number): void;
export function setColor(v1: number, v2?: number, v3?: number): void {
    if (typeof v2 === 'number' && typeof v3 === 'number') {
        sketch.stroke(v1, v2, v3);
    } else {
        sketch.stroke(v1);
    }
}

/**
 * Sets drawing thickness.
 * @param value - thickness
 */
export function setThickness(value: number): void {
    sketch.strokeWeight(value);
}

/**
 * Sets background color.
 * @param value - greyscale value
 */
export function setBackground(value: number): void;
/**
 * Sets background color.
 * @param v1 - red channel value
 * @param v2 - green channel value
 * @param v3 - blue channel value
 */
export function setBackground(v1: number, v2?: number, v3?: number): void;
export function setBackground(v1: number, v2?: number, v3?: number): void {
    if (typeof v2 === 'number' && typeof v3 === 'number') {
        sketch.background(v1, v2, v3);
    } else {
        sketch.background(v1);
    }
}

/**
 * Clears the canvas.
 */
export function clear(): void {
    sketch.clear(0, 0, 0, 0);
}

/**
 * Export the canvas drawing in png format
 */
export function exportDrawing(): void {
    let fileName = prompt('Filename:', 'My Project');
    if (fileName) {
        sketch.saveCanvas(fileName, 'png');
    }
}

let recorder: MediaRecorder;
let chunks: BlobPart[] = [];

/**
 * Start recording the canvas
 */
export function startRecording() {
    record();
    recorder.start();
}

/**
 * Stops recording the canvas
 */
export function stopRecording() {
    if (recorder != null) {
        recorder.stop();
    }
    console.log(chunks);
}

async function exportVideo() {
    let blob = new Blob(chunks, { type: 'video/wemb' });

    // Draw video to screen
    let videoElement = document.createElement('video');
    let temp = Date.now();
    videoElement.setAttribute('id', temp.toString());
    videoElement.controls = true;
    videoElement.src = window.URL.createObjectURL(blob);

    // Download the video
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'newVid.webm';
    a.click();
}

// FrameRate for recording
const fr = 30;

function record() {
    chunks.length = 0;

    let stream = document.querySelectorAll('canvas')[1]?.captureStream(fr);

    if (stream != undefined) {
        recorder = new MediaRecorder(stream);

        recorder.ondataavailable = (e) => {
            if (e.data.size) {
                chunks.push(e.data);
            }
        };
    }
    recorder.onstop = exportVideo;
}
