import konva from 'konva';
import { GraphSystem } from "../system";
import { GraphEventType } from '../../event';
import { GraphEngine } from '../../engine';
import { GraphVisualSystem } from './visual';

export class SceneManager extends GraphSystem {
  nodes = new Map<string, NodeEntity>();
  edges = new Map<string, EdgeEntity>();

  _layer = new konva.Layer();

  private needsDrawing = false;

  markNeedsDrawing() {
    this.needsDrawing = true;
  }

  init(): void { }

  update() {
    if (this.needsDrawing) {
      this._layer.draw();
      this.needsDrawing = false;
    }
  }

  addNode(entity: NodeEntity) {
    let node = this.graph.addNode()

    entity.key = node.key;
    this.nodes.set(node.key, entity);

    this._layer.add(entity._shape);
  }

  removeNode(entity: NodeEntity) {
    if (entity.key == undefined) return;

    this.graph.removeNode(this.graph.getNodeByKey(entity.key)!)
    this.nodes.delete(entity.key);

    entity.key = undefined;
    entity._shape.remove();
  }

  addEdge(entity: EdgeEntity) {
    let from = this.graph.getNodeByKey(entity.from.key!);
    let to = this.graph.getNodeByKey(entity.to.key!);
    let edge = this.graph.addEdge(from!, to!);
    entity.key = edge.key;
    this.edges.set(edge.key, entity);

    this._layer.add(entity._shape)
  }

  removeEdge(entity: EdgeEntity) {
    if (entity.key == undefined) return;

    let edge = this.graph.getEdgeByKey(entity.key)!;
    this.graph.removeEdge(edge);
    this.edges.delete(edge.key);

    entity.key = undefined;
    entity._shape.remove();
  }

  onEvent(type: GraphEventType, key: string) {
    switch (type) {
      case GraphEventType.nodeAdded: {
        let node = new NodeEntity(0, 0);
        node.key = key;

        this.nodes.set(key, node);
        this._layer.add(node._shape);

        break;
      }
      case GraphEventType.nodeRemoved: {
        let node = this.nodes.get(key)!;
        node.key = undefined;
        node._shape.remove();

        this.nodes.delete(key);

        break;
      }
      case GraphEventType.edgeAdded: {
        let edge = this.graph.getEdgeByKey(key)!;
        let firstNode = this.nodes.get(edge.firstNode.key)!;
        let secondNode = this.nodes.get(edge.secondNode.key)!;

        let edgeEntity = new EdgeEntity(firstNode, secondNode);
        this.edges.set(key, edgeEntity);
        this._layer.add(edgeEntity._shape);

        break;
      }
      case GraphEventType.edgeRemoved: {
        let edge = this.edges.get(key)!;
        edge.key = undefined;
        edge._shape.remove();

        this.edges.delete(key);

        break;
      }
    }

    this.markNeedsDrawing();
  }
}


abstract class Entity {
  key: string | undefined;

  public get graphic(): konva.Shape { return this._shape.children[0] as konva.Shape; }
  public set graphic(shape: konva.Shape) {
    this._shape.removeChildren();
    this._shape.add(shape);
  }

  public _shape: konva.Group;

  constructor(graphic: konva.Shape) {
    this._shape = new konva.Group();
    this._shape.add(graphic);
  }

  public get position() { return this.graphic.position() };
  public get events() {
    return { on: this._shape.on.bind(this._shape), off: this._shape.off.bind(this._shape) };
  }
}

export class NodeEntity extends Entity {
  constructor(x: number, y: number) {
    super(NodeEntity.createNode(x, y));

    let system = GraphEngine.instance.systems.get(GraphVisualSystem.name)! as GraphVisualSystem
    this.events.on('dragmove', () => {
      if (this.key === undefined) return;
      let edges = system.graph.getEdgesOfNode(system.graph.getNodeByKey(this.key)!)
      edges.forEach((edge) => {
        let edgeEntity = system.edges.get(edge.key)!

        edgeEntity.graphic = EdgeEntity.createEdge(
          system.nodes.get(edge.firstNode.key)!,
          system.nodes.get(edge.secondNode.key)!
        );

        system.markNeedsDrawing();
      });
    });
  }

  static createNode(x: number, y: number): konva.Circle {
    let node = new konva.Circle({
      x: x, y: y,
      radius: 10,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2,
      draggable: true,
    });

    return node;
  }
}

export class EdgeEntity extends Entity {
  constructor(public from: NodeEntity, public to: NodeEntity) {
    super(EdgeEntity.createEdge(from, to));
  }

  static createEdge(from: NodeEntity, to: NodeEntity): konva.Line {
    let edge = new konva.Line({
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2,
      points: [
        from.position.x, from.position.y,
        to.position.x, to.position.y,
      ],
    });

    return edge;
  }
}
