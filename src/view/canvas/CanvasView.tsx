export class CanvasView {

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  width: number;
  height: number;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.width = window.innerWidth;  //default values
    this.height = window.innerHeight; //default values
    this.canvas.width = 150;
    this.canvas.height = 234;
    this.ctx = this.canvas.getContext("2d");
  }

  refreshCanvas = ():void => {
    console.log(this.canvas);
    console.log(this.width);
    console.log(this.height);
  };

  isCanvasBlank = (): boolean => {
    const emptyCanvas: HTMLCanvasElement = document.createElement("canvas");
    return emptyCanvas == this.canvas;
  }

}