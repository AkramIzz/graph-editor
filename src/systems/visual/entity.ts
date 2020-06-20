import konva from "konva";
import { GraphEngine } from "../../engine";
import { GraphVisualSystem } from "./visual";

abstract class Entity {
  key: string | undefined;

  public get graphic(): konva.Group | konva.Shape {
    return this._shape.children[0] as konva.Shape;
  }
  public set graphic(shape: konva.Group | konva.Shape) {
    this._shape.removeChildren();
    this._shape.add(shape);
  }

  public _shape: konva.Group;

  constructor(graphic: konva.Group | konva.Shape) {
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
  private _nodeGraphic: konva.Shape;

  private _color: string;

  private _key: string | undefined;
  get key(): string | undefined {
    return this._key;
  }
  set key(value: string | undefined) {
    this._key = value;
    let system = GraphEngine.instance.systems.get(
      GraphVisualSystem.name
    )! as GraphVisualSystem;
    [this.graphic, this._nodeGraphic] = NodeEntity.createNode(this.position.x, this.position.y, this.color, value);
    system.scene.markNeedsDrawing();
  }

  get color(): string {
    return this._color;
  }

  set color(color: string) {
    let system = GraphEngine.instance.systems.get(
      GraphVisualSystem.name
    )! as GraphVisualSystem;
    this._nodeGraphic.fill(color);
    system.scene.markNeedsDrawing();

    this._color = color;
  }

  constructor(x: number, y: number, color: string = "white") {
    let [graphic, nodeGraphic] = NodeEntity.createNode(x, y, color);
    super(graphic);
    this._nodeGraphic = nodeGraphic;
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

  static createNode(
    x: number,
    y: number,
    color: string,
    key?: string
  ): [konva.Group, konva.Shape] {
    let group = new konva.Group({
      x: x,
      y: y,
      draggable: true
    });

    let node = new konva.Circle({
      x: 0,
      y: 0,
      radius: 10,
      fill: color,
      stroke: "black",
      strokeWidth: 2,
      draggable: key === undefined,
    });

    group.add(node);

    if (key !== undefined) {
      let text = new konva.Text({ text: key, x: 10, y: -10 });
      group.add(text);
    }

    return [group, node];
  }
}

export class EdgeEntity extends Entity {
  private _color: string;

  get color(): string {
    return this._color;
  }

  set color(color: string) {
    this.graphic = this.graphic as konva.Line;
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
