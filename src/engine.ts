import { GraphEventsStream } from "./event";
import { GraphSystem } from "./systems/system";
import { GraphVisualSystem } from "./systems/visual/visual";
import { GraphCodeEditorSystem } from "./systems/code/code";
import { GraphHistorySystem } from "./systems/history/history";
import { GraphPersistenceSystem, NodeData, EdgeData } from "./systems/persist/persist";

import { VisualSystemPersistenceHook } from "./hooks/persist/visual";
import { LocalStorageStore } from "./systems/persist/store";

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
    this.systems.set(GraphVisualSystem.name, new GraphVisualSystem(this, this.graph));
    this.systems.set(GraphCodeEditorSystem.name, new GraphCodeEditorSystem(this, this.graph));
    this.systems.set(GraphHistorySystem.name, new GraphHistorySystem(this, this.graph));
    this.systems.set(
      GraphPersistenceSystem.name,
      new GraphPersistenceSystem(
        this,
        this.graph,
        new LocalStorageStore<Array<NodeData>>({ stringify: JSON.stringify, parse: JSON.parse }),
        new LocalStorageStore<Array<EdgeData>>({ stringify: JSON.stringify, parse: JSON.parse }),
        new LocalStorageStore<Map<string, any>>({ stringify: JSON.stringify, parse: JSON.parse }),
      ),
    );

    (this.systems.get(GraphPersistenceSystem.name) as GraphPersistenceSystem)
      .registerHook(new VisualSystemPersistenceHook());

    this.systems.forEach((system) => {
      system.init();
    });

    this.systems.forEach((system) => {
      system.start();
    });
  }

  private animationFrame: number | undefined;

  run() {
    this.update();
    this.animationFrame = requestAnimationFrame(this.run.bind(this));
  }

  update() {
    this.systems.forEach(system => {
      system.update();
    });
  }

  restart() {
    let shouldRerun = false;
    if (this.animationFrame !== undefined) {
      cancelAnimationFrame(this.animationFrame);
      shouldRerun = true;
    }

    this.graph = new GraphEventsStream();
    this.systems.forEach((system) => {
      system.restart(this.graph);
    });

    if (shouldRerun) {
      this.run();
    }
  }
}
