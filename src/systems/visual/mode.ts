import { GraphVisualSystem } from './visual';
import { EdgeEntity, NodeEntity } from './scene_manger'

export interface Mode {
  begin(system: GraphVisualSystem): void;
  end(system: GraphVisualSystem): void;
}

export class NodeMode implements Mode {
  begin(system: GraphVisualSystem) {
    this.configureCreation(system);
    this.configureDestruction(system);
  }

  end(system: GraphVisualSystem) {
    let nodes = system.nodes;
    nodes.forEach((n) => n.events.off('click'));
    system.stage.off('click');
  }

  private configureCreation(system: GraphVisualSystem) {
    system.stage.on('click', () => {
      console.log('handling event');
      let pointer = system.stage.getPointerPosition();
      if (pointer != null) {
        let node = new NodeEntity(pointer.x, pointer.y);
        node.events.on('click', () => {
          system.removeNode(node);
          system.markNeedsDrawing();
        });
        system.addNode(node);
        system.markNeedsDrawing();
      }
    });
  }

  private configureDestruction(system: GraphVisualSystem) {
    let nodes = system.nodes
    nodes.forEach((n) => n.events.on('click', () => {
      system.removeNode(n);
      system.markNeedsDrawing();
    }));
  }
}

export class EdgeMode implements Mode {
  begin(system: GraphVisualSystem) {
    this.create(system);
    this.destroy(system);
  }

  end(system: GraphVisualSystem) {
    let nodes = system.nodes;
    nodes.forEach((n) => n.events.off('click'));
    let edges = system.edges;
    edges.forEach((e) => e.events.off('click'));
  }

  create = (system: GraphVisualSystem) => {
    let from: NodeEntity | null = null;
    let to: NodeEntity | null = null;
    let nodes = system.nodes;
    nodes.forEach((n) => n.events.on('click', () => {
      if (from == null) {
        from = n;
      } else if (to == null) {
        to = n;
      }

      if (from != null && to != null) {
        let edge = new EdgeEntity(from, to);
        edge.events.on('click', () => {
          system.removeEdge(edge);
          system.markNeedsDrawing();
        });
        system.addEdge(edge);
        system.markNeedsDrawing();
        from = to = null;
      }
    }));
  }

  destroy = (system: GraphVisualSystem) => {
    let edges = system.edges;
    edges.forEach((e) => e.events.on('click', () => {
      system.removeEdge(e);
      system.markNeedsDrawing();
    }));
  }
}
