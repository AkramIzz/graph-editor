import { GraphEventsStream } from "./event";
import { GraphSystem } from "./systems/system";

export class GraphEngine {
  static readonly instance = new GraphEngine();

  systems = new Map<string, GraphSystem>();
  graph = new GraphEventsStream();

  constructor(options: { selfStart: boolean } = { selfStart: false }) {
    this.init();

    if (options.selfStart) {
      this.run();
    }
  }

  private init(): void {
    this.systems.forEach((system) => {
      system.init();
    });
  }

  run() {
    this.update();
    requestAnimationFrame(this.run.bind(this));
  }

  update() {
    this.systems.forEach(system => {
      system.update();
    });
  }
}
