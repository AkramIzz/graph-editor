import { GraphPersistenceHook } from "./hook";
import { Store } from "./store";
import { GraphSystemWithHooks } from "../system";
import { GraphEventType, GraphEventsStream } from "../../event";
import { GraphEngine } from "../../engine";

export type NodeData = string;

export interface EdgeData {
  key: string;
  from: string;
  to: string;
}

export class GraphPersistenceSystem extends GraphSystemWithHooks<
  GraphPersistenceHook
> {
  constructor(
    engine: GraphEngine,
    graph: GraphEventsStream,
    private nodesStore: Store<Array<NodeData>>,
    private edgesStore: Store<Array<EdgeData>>,
    private systemsStore: Store<Map<string, any>>
  ) {
    super(engine, graph);
  }

  init(): void {
    let saveButton = document.getElementById("saveButton");
    if (saveButton !== null) {
      saveButton.onclick = () => {
        this.save("name");
      };
    }

    let loadButton = document.getElementById("loadButton");
    if (loadButton !== null) {
      loadButton.onclick = () => {
        this.load("name");
      };
    }
  }

  update(): void {}

  onEvent(type: GraphEventType, key: string): void {}

  async save(name: string) {
    let nodesData = await this.nodesStore.open("nodes_db");
    let edgesData = await this.edgesStore.open("edges_db");

    let nodes: Array<string> = Array.from(this.graph.nodes.keys());
    let edges: Array<EdgeData> = Array.from(
      this.graph.edges.values(),
      (edge, _) => {
        return {
          key: edge.key,
          from: edge.firstNode.key,
          to: edge.secondNode.key
        };
      }
    );

    nodesData.put("nodes", nodes);
    edgesData.put("edges", edges);

    nodesData.close();
    edgesData.close();

    this.hooks.forEach(hook => {
      this.systemsStore.open(hook.name).then(storeData => {
        nodes.forEach(key => {
          let data = hook.serializeNode(key);
          if (data !== undefined) {
            storeData.put(key, data);
          }
        });

        edges.forEach(e => {
          let data = hook.serializeEdge(e.key);
          if (data !== undefined) {
            storeData.put(e.key, data);
          }
        });

        let data = hook.serializeSystem();
        if (data !== undefined) {
          storeData.put(hook.name, data);
        }

        storeData.close();
      });
    });
  }

  async load(name: string) {
    this.engine.restart();

    let nodesData = await this.nodesStore.open("nodes_db");
    let edgesData = await this.edgesStore.open("edges_db");

    let oldNodes = (await nodesData.get("nodes"))!;
    let oldEdges = (await edgesData.get("edges"))!;

    let oldToNewNodeKey = new Map<string, string>();
    oldNodes.forEach(oldKey => {
      let node = this.graph.addNode();
      oldToNewNodeKey.set(oldKey, node.key);
    });
    console.log(oldToNewNodeKey);

    let oldToNewEdgeKey = new Map<string, string>();
    oldEdges.forEach(oldEdge => {
      let from = this.graph.nodes.get(oldToNewNodeKey.get(oldEdge.from)!)!;
      let to = this.graph.nodes.get(oldToNewNodeKey.get(oldEdge.to)!)!;
      let edge = this.graph.addEdge(from, to);
      oldToNewEdgeKey.set(oldEdge.key, edge.key);
    });
    console.log(oldToNewEdgeKey);

    this.hooks.forEach(hook => {
      this.systemsStore.open(hook.name).then(async storeData => {
        await new Promise((resolve, _) => {
          oldToNewNodeKey.forEach(async (newKey, oldKey) => {
            let data = await storeData.get(oldKey);
            hook.deserializeNode(newKey, data);
          });
          resolve();
        });

        await new Promise((resolve, _) => {
          oldToNewEdgeKey.forEach(async (newKey, oldKey) => {
            let data = await storeData.get(oldKey);
            hook.deserializeEdge(newKey, data);
          });
          resolve();
        });

        let data = await storeData.get(hook.name);
        hook.deserializeSystem(data);

        storeData.close();
      });
    });
  }
}
