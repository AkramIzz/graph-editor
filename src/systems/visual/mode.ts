import { GraphVisualSystem } from './visual';
import { EdgeEntity, NodeEntity } from './entity'

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
    let nodes = system.scene.nodes;
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
          system.scene.removeNode(node);
          system.scene.markNeedsDrawing();
        });
        system.scene.addNode(node);
        system.scene.markNeedsDrawing();
      }
    });
  }

  private configureDestruction(system: GraphVisualSystem) {
    let nodes = system.scene.nodes
    nodes.forEach((n) => n.events.on('click', () => {
      system.scene.removeNode(n);
      system.scene.markNeedsDrawing();
    }));
  }
}

export class EdgeMode implements Mode {
  begin(system: GraphVisualSystem) {
    this.create(system);
    this.destroy(system);
  }

  end(system: GraphVisualSystem) {
    let nodes = system.scene.nodes;
    nodes.forEach((n) => n.events.off('click'));
    let edges = system.scene.edges;
    edges.forEach((e) => e.events.off('click'));
  }

  create = (system: GraphVisualSystem) => {
    let from: NodeEntity | null = null;
    let to: NodeEntity | null = null;
    let nodes = system.scene.nodes;
    nodes.forEach((n) => n.events.on('click', () => {
      if (from == null) {
        from = n;
      } else if (to == null) {
        to = n;
      }

      if (from != null && to != null) {
        let edge = new EdgeEntity(from, to);
        edge.events.on('click', () => {
          system.scene.removeEdge(edge);
          system.scene.markNeedsDrawing();
        });
        system.scene.addEdge(edge);
        system.scene.markNeedsDrawing();
        from = to = null;
      }
    }));
  }

  destroy = (system: GraphVisualSystem) => {
    let edges = system.scene.edges;
    edges.forEach((e) => e.events.on('click', () => {
      system.scene.removeEdge(e);
      system.scene.markNeedsDrawing();
    }));
  }
}
