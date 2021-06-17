import { CanvasView } from "../view/canvas/CanvasView";

export class CanvasController {

  public canvasView: CanvasView;

  constructor(canvasView: CanvasView){
    this.canvasView = canvasView;
  };
  
  refreshCanvas = (): void => {
    this.canvasView.refreshCanvas();
  };

  isCanvasBlank = (): boolean => {
    return (this.canvasView.isCanvasBlank());
  }

};

