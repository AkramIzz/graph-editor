import konva from "konva";
import { GraphEventType } from "../../event";
import { NodeEntity, EdgeEntity } from "./entity";
import { Graph } from "../../graph";
import { GraphConvexHulls } from "./convex_hull";

export class Scene {
  Node = NodeEntity;
  Edge = EdgeEntity;

  nodes = new Map<string, NodeEntity>();
  edges = new Map<string, EdgeEntity>();

  _layer = new konva.Layer();

  nodes_keys = new Array<string>();
  line_ends = new Array<string>();

  private needsDrawing = false;

  constructor(private graph: Graph) {}

  markNeedsDrawing() {
    this.needsDrawing = true;
  }

  init(): void {}

  update() {
    if (this.needsDrawing) {
      this._layer.draw();
      this.needsDrawing = false;
    }
  }

  addNode(entity: NodeEntity) {
    let node = this.graph.addNode();

    entity.key = node.key;
    this.nodes.set(node.key, entity);

    this._layer.add(entity._shape);

    this.updateConvexHulls();
  }

  removeNode(entity: NodeEntity) {
    if (entity.key == undefined) return;

    this.graph.removeNode(this.graph.getNodeByKey(entity.key)!);
    this.nodes.delete(entity.key);

    entity.key = undefined;
    entity._shape.remove();

    this.updateConvexHulls();
  }

  addEdge(entity: EdgeEntity) {
    let from = this.graph.getNodeByKey(entity.from.key!);
    let to = this.graph.getNodeByKey(entity.to.key!);
    let edge = this.graph.addEdge(from!, to!);
    entity.key = edge.key;
    this.edges.set(edge.key, entity);

    this._layer.add(entity._shape);
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
        edgeEntity.key = key;
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

  allConvexHulls() {
    [this.nodes_keys, this.line_ends] = new GraphConvexHulls(this.nodes).get();
  }

  removeConvexHulls = () => {
    if (this.nodes_keys.length > 1) {
      for (let i = 0; i < this.nodes_keys.length; i++) {
        let f_node = this.graph.getNodeByKey(this.nodes_keys[i]);
        let l_node = this.graph.getNodeByKey(this.line_ends[i]);
        if (f_node != undefined && l_node != undefined) {
          if (this.graph.getEdgeByNodes(f_node!, l_node!)) {
            let e_key = this.graph.getEdgeByNodes(f_node!, l_node!)!.key;
            let e = this.edges.get(e_key);
            this.removeEdge(e!);
          }
        }
      }
    }
  };

  drawConvexHulls = () => {
    if (this.nodes_keys.length > 1) {
      for (let i = 0; i < this.nodes_keys.length; i++) {
        let f = this.nodes.get(this.nodes_keys[i])!;
        let l = this.nodes.get(this.line_ends[i])!;
        let e = new EdgeEntity(f, l);
        let f_node = this.graph.getNodeByKey(this.nodes_keys[i]);
        let l_node = this.graph.getNodeByKey(this.line_ends[i]);
        if (!this.graph.getEdgeByNodes(f_node!, l_node!)) {
          this.addEdge(e);
        }
      }
    }
  };

  updateConvexHulls = () => {
    this.removeConvexHulls();
    this.allConvexHulls();
    this.drawConvexHulls();
  };
}
