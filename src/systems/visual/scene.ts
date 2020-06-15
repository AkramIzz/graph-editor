import konva from "konva";
import { GraphEventType } from "../../event";
import { NodeEntity, EdgeEntity } from "./entity";
import { Graph } from "../../graph";

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

  getNodePosition = (index: number) => {
    return this.nodes.get(this.nodes_keys[index])!.position;
  };

  comparePoints = (a: string, b: string) => {
    let x1 = this.nodes.get(a)!.position.x;
    let y1 = this.nodes.get(a)!.position.y;

    let x2 = this.nodes.get(b)!.position.x;
    let y2 = this.nodes.get(b)!.position.y;

    if (x1 > x2 || (x1 == x2 && y1 > y2)) {
      return 1;
    } else if (x1 < x2 || (x1 == x2 && y1 < y2)) {
      return -1;
    } else {
      return 0;
    }
  };

  crossProduct(a: any, b: any, c: any) {
    let y1 = a.y - b.y;
    let y2 = a.y - c.y;
    let x1 = a.x - b.x;
    let x2 = a.x - c.x;
    return y2 * x1 - y1 * x2;
  }

  distance(a: any, b: any, c: any) {
    let y1 = a.y - b.y;
    let y2 = a.y - c.y;
    let x1 = a.x - b.x;
    let x2 = a.x - c.x;
    let item1 = y1 * y1 + x1 * x1;
    let item2 = y2 * y2 + x2 * x2;

    if (item1 == item2) return 0;
    else if (item1 < item2) return -1;
    return 1;
  }

  convexHull(pos: number = 0) {
    let start = this.nodes.get(this.nodes_keys[pos])!.position;
    let current = start;
    let current_id = pos;
    let collinear = Array<number>();
    let result = Array<number>();

    while (true) {
      let nextTarget = this.getNodePosition(pos);
      let next_id = pos;

      for (let i = pos; i < this.nodes_keys.length; i++) {
        if (i == current_id) continue;
        if (this.nodes_keys[i] != this.line_ends[i]) continue;
        let val = this.crossProduct(
          current,
          nextTarget,
          this.getNodePosition(i)
        );

        if (val > 0) {
          nextTarget = this.getNodePosition(i);
          next_id = i;
          collinear = [];
        } else if (val == 0) {
          if (this.distance(current, nextTarget, this.getNodePosition(i)) < 0) {
            collinear.push(next_id);
            nextTarget = this.getNodePosition(i);
            next_id = i;
          } else {
            collinear.push(i);
          }
        }
      }

      for (let i = 0; i < collinear.length; i++) {
        if (result.length > 0 && collinear[i] == result[0]) continue;
        result.push(collinear[i]); //add allpoints in collinear points to result set
      }

      if (next_id == pos) break;
      result.push(next_id);
      current = nextTarget;
      current_id = next_id;
    }

    for (let i = 0; i < result.length; i++) {
      this.line_ends[result[i]] = this.nodes_keys[
        result[(i + 1) % result.length]
      ];
    }
  }

  allConvexHulls() {
    this.nodes_keys = Array.from(this.nodes.keys());
    if (this.nodes_keys.length > 0) {
      this.nodes_keys.sort(this.comparePoints);
      this.line_ends = Object.assign([], this.nodes_keys);
      for (let i = 0; i < this.nodes_keys.length; i++) {
        if (this.nodes_keys[i] == this.line_ends[i]) {
          this.convexHull(i);
        }
      }
    } else {
      this.nodes_keys = [];
      this.line_ends = [];
    }
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
