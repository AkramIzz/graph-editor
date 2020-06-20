import konva from "konva";
import { GraphSystem } from "../system";
import { Mode, NodeMode, EdgeMode } from "./mode";
import { Scene } from "./scene";
import { GraphEventType } from "../../event";

export class GraphVisualSystem extends GraphSystem {
  stage = new konva.Stage({
    container: "stage",
    width: document.getElementById("stage")?.getBoundingClientRect().width,
    height: document.getElementById("stage")?.getBoundingClientRect().height
  });

  scene!: Scene;

  private currentMode: Mode | undefined;

  changeMode() {
    this.currentMode?.end(this);

    if (this.currentMode instanceof NodeMode) {
      this.currentMode = new EdgeMode();
    } else if (this.currentMode instanceof EdgeMode) {
      this.currentMode = new NodeMode();
    }

    this.currentMode?.begin(this);
  }

  init() {
    window.addEventListener("keypress", ev => {
      if (ev.key == "m") {
        console.log("changing mode");
        this.changeMode();
      }
    });
  }

  start() {
    this.scene = new Scene(this.graph);
    this.currentMode = this.currentMode ?? new NodeMode();

    this.stage.add(this.scene._layer);
    this.scene.markNeedsDrawing();

    this.currentMode.begin(this);
  }

  stop() {
    this.currentMode?.end(this);
    this.stage.removeChildren();
    this.scene._layer.destroy();
  }

  update() {
    this.scene.update();
  }

  onEvent(type: GraphEventType, key: string): void {
    this.scene.onEvent(type, key);

    switch (type) {
      case GraphEventType.edgeAdded:
      case GraphEventType.nodeAdded:
        // TODO this is just a workaround
        // I think it may be better to pass on the new node or edge for configuration
        this.currentMode?.end(this);
        this.currentMode?.begin(this);
        break;
    }
  }
}
