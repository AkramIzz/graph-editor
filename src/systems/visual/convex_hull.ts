import { NodeEntity } from "../visual/entity";

export class GraphConvexHulls {
  private _ran = false;
  private nodes_keys: Array<NodeEntity>;
  private line_ends: Array<NodeEntity>;

  constructor(private nodes: Map<string, NodeEntity>) {
    if (this.nodes.size == 0) {
      this.nodes_keys = [];
      this.line_ends = [];
    } else {
      this.nodes_keys = Array.from(this.nodes.values());
      this.nodes_keys.sort(this.comparePoints);
      this.line_ends = Object.assign([], this.nodes_keys);
    }
  }

  run() {
    for (let i = 0; i < this.nodes_keys.length; ++i) {
      if (this.nodes_keys[i] == this.line_ends[i]) {
        this.convexHull(i);
      }
    }
  }

  get() {
    if (!this._ran) {
      this.run();
      this._ran = true;
    }

    return [this.nodes_keys, this.line_ends];
  }

  convexHull(pos: number = 0) {
    let start = this.nodes_keys[pos].position;
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

  getNodePosition = (index: number) => {
    return this.nodes_keys[index].position;
  };

  comparePoints = (a: NodeEntity, b: NodeEntity) => {
    let x1 = a.position.x;
    let y1 = a.position.y;

    let x2 = b.position.x;
    let y2 = b.position.y;

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
}
