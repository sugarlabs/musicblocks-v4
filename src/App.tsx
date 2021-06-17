import "./App.scss";
import Landing from "./view/web/Landing";
import { CanvasController } from "./Controller/CanvasController";
import { CanvasView } from "./view/canvas/CanvasView";

export default function App(): JSX.Element {
  const canva = new CanvasController( new CanvasView());
  canva.refreshCanvas();
  console.log(canva.isCanvasBlank());
  return <Landing />;
}
