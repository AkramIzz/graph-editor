import konva from 'konva';
import { GraphSystem } from '../system';
import { Mode, NodeMode, EdgeMode } from './mode';
import { Scene } from './scene_manger';
import { GraphEventType } from '../../event';

export class GraphVisualSystem extends GraphSystem {
  stage = new konva.Stage({
    container: 'stage',
    width: window.innerWidth / 3,
    height: window.innerHeight * 0.8,
  });

  scene = new Scene(this.graph);

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

    this.stage.add(this.scene._layer);

    window.addEventListener('keypress', (ev) => {
      if (ev.key == 'm') {
        console.log('changing mode');
        this.changeMode();
      }
    });

    this.scene.markNeedsDrawing();
  }

  update() {
    this.scene.update();
  }

  onEvent(type: GraphEventType, key: string): void {
    this.scene.onEvent(type, key);
  }
}
