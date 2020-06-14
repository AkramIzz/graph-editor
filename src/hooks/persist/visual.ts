import { GraphPersistenceHook } from "../../systems/persist/hook";
import { GraphVisualSystem } from "../../systems/visual/visual";
import { GraphEngine } from "../../engine";

export class VisualSystemPersistenceHook extends GraphPersistenceHook {
  get system(): GraphVisualSystem {
    return GraphEngine.instance.systems.get(
      GraphVisualSystem.name
    )! as GraphVisualSystem;
  }

  get name(): string {
    return "VisualSystem";
  }

  serializeSystem(): any | undefined {
    return undefined;
  }

  serializeNode(key: string): any | undefined {
    let entity = this.system.scene.nodes.get(key)!;
    return {
      x: entity.position.x,
      y: entity.position.y,
      color: entity.color
    };
  }

  serializeEdge(key: string): any | undefined {
    let entity = this.system.scene.edges.get(key)!;
    return { color: entity.color };
  }

  deserializeSystem(data: any | undefined): void {
    this.system.scene.markNeedsDrawing();
  }

  deserializeNode(key: string, data: any | undefined): void {
    if (data === undefined) throw Error("not reachable");

    let node = {
      x: data.x as number,
      y: data.y as number,
      color: data.color as string
    };

    let entity = this.system.scene.nodes.get(key);
    if (entity !== undefined) {
      entity.position = { x: node.x, y: node.y };
      entity.color = node.color;
    } else {
      throw Error("node entity was not found");
    }
  }

  deserializeEdge(key: string, data: any | undefined): void {
    if (data === undefined) throw Error("not reachable");

    let edge = { color: data.color as string };
    let entity = this.system.scene.edges.get(key);
    if (entity !== undefined) {
      entity.graphic = this.system.scene.Edge.createEdge(
        entity.from,
        entity.to,
        edge.color
      );
    } else {
      throw Error("edge entity was not found");
    }
  }
}
