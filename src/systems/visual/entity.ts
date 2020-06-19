import konva from "konva";
import { GraphEngine } from "../../engine";
import { GraphVisualSystem } from "./visual";

abstract class Entity {
  key: string | undefined;

  public get graphic(): konva.Shape {
    return this._shape.children[0] as konva.Shape;
  }
  public set graphic(shape: konva.Shape) {
    this._shape.removeChildren();
    this._shape.add(shape);
  }

  public _shape: konva.Group;

  constructor(graphic: konva.Shape) {
    this._shape = new konva.Group();
    this._shape.add(graphic);
  }

  public get position() {
    return this.graphic.position();
  }
  public set position(vec: { x: number; y: number }) {
    this.graphic.position(vec);
  }

  public get events() {
    return {
      on: this._shape.on.bind(this._shape),
      off: this._shape.off.bind(this._shape)
    };
  }
}

export class NodeEntity extends Entity {
  private _color: string;

  get color(): string {
    return this._color;
  }

  set color(color: string) {
    let system = GraphEngine.instance.systems.get(
      GraphVisualSystem.name
    )! as GraphVisualSystem;
    this.graphic.fill(color);
    system.scene.markNeedsDrawing();

    this._color = color;
  }

  constructor(x: number, y: number, color: string = "white") {
    super(NodeEntity.createNode(x, y, color));
    this._color = color;

    let system = GraphEngine.instance.systems.get(
      GraphVisualSystem.name
    )! as GraphVisualSystem;
    this.events.on("dragmove", () => {
      if (this.key === undefined) return;
      let edges = system.graph.getEdgesOfNode(
        system.graph.getNodeByKey(this.key)!
      );
      edges.forEach(edge => {
        let edgeEntity = system.scene.edges.get(edge.key)!;

        edgeEntity.graphic = EdgeEntity.createEdge(
          system.scene.nodes.get(edge.firstNode.key)!,
          system.scene.nodes.get(edge.secondNode.key)!,
          edgeEntity.color
        );

        system.scene.markNeedsDrawing();
      });
    });
  }

  static createNode(x: number, y: number, color: string): konva.Circle {
    let node = new konva.Circle({
      x: x,
      y: y,
      radius: 10,
      fill: color,
      stroke: "black",
      strokeWidth: 2,
      draggable: true
    });

    return node;
  }
}

export class EdgeEntity extends Entity {
  private _color: string;

  get color(): string {
    return this._color;
  }

  set color(color: string) {
    let system = GraphEngine.instance.systems.get(
      GraphVisualSystem.name
    )! as GraphVisualSystem;
    this.graphic.stroke(color);
    system.scene.markNeedsDrawing();

    this._color = color;
  }

  constructor(
    public from: NodeEntity,
    public to: NodeEntity,
    color: string = "black"
  ) {
    super(EdgeEntity.createEdge(from, to, color));
    this._color = color;
  }

  static createEdge(
    from: NodeEntity,
    to: NodeEntity,
    color: string
  ): konva.Line {
    let edge = new konva.Line({
      fill: "white",
      stroke: color,
      strokeWidth: 2,
      points: [from.position.x, from.position.y, to.position.x, to.position.y]
    });

    return edge;
  }
}
