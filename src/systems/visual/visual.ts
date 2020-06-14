import konva from "konva";
import { Mode, NodeMode, EdgeMode } from "./mode";
import { SceneManager } from "./scene_manger";

export class GraphVisualSystem extends SceneManager {
  stage = new konva.Stage({
    container: "stage",
    width: window.innerWidth / 3,
    height: window.innerHeight * 0.8,
  });

  private currentMode: Mode = new NodeMode();

  changeMode() {
    this.currentMode.end(this);

    if (this.currentMode instanceof NodeMode) {
      this.currentMode = new EdgeMode();
    } else if (this.currentMode instanceof EdgeMode) {
      this.currentMode = new NodeMode();
    }

    this.currentMode.begin(this);
  }

  init() {
    this.currentMode.begin(this);

    this.stage.add(this._layer);

    window.addEventListener("keypress", (ev) => {
      if (ev.key == "m") {
        console.log("changing mode");
        this.changeMode();
      }
    });

    this.markNeedsDrawing();
  }

  update() {
    super.update();
  }
}
