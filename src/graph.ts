export interface GraphNode {
  readonly key: string;
  value?: any;
}

export interface GraphEdge {
  readonly key: string;
  readonly firstNode: GraphNode;
  readonly secondNode: GraphNode;
  value?: any;
}

class GraphEdgeImpl implements GraphEdge {
  public readonly key: string;

  constructor(
    public readonly firstNode: GraphNodeImpl,
    public readonly secondNode: GraphNodeImpl,
    public value?: any
  ) {
    this.key = GraphEdgeImpl.keyOf(firstNode, secondNode);
  }

  static keyOf(firstNode: GraphNode, secondNode: GraphNode): string {
    if (secondNode.key < firstNode.key) {
      let temp = firstNode;
      firstNode = secondNode;
      secondNode = temp;
    }

    return `${firstNode.key}-${secondNode.key}`;
  }
}

class GraphNodeImpl implements GraphNode {
  public readonly key: string;
  public edges = new Set<GraphEdgeImpl>();

  constructor(public readonly value?: any) {
    this.key = (GraphNodeImpl._nextId++).toString();
  }

  private static _nextId = 0;
}

export class Graph {
  public readonly edges = new Map<string, GraphEdge>();
  public readonly nodes = new Map<string, GraphNode>();

  addEdge(
    _firstNode: GraphNode,
    _secondNode: GraphNode,
    value?: any
  ): GraphEdge {
    let firstNode = _firstNode as GraphNodeImpl;
    let secondNode = _secondNode as GraphNodeImpl;

    let key = GraphEdgeImpl.keyOf(firstNode, secondNode);
    if (this.edges.has(key)) {
      throw new GraphEdgeExistsError();
    }

    let edge = new GraphEdgeImpl(firstNode, secondNode, value);
    this.edges.set(key, edge);
    firstNode.edges.add(edge);
    secondNode.edges.add(edge);
    return edge;
  }

  addNode(value?: any): GraphNode {
    let node = new GraphNodeImpl(value);
    this.nodes.set(node.key, node);
    return node;
  }

  removeEdge(_edge: GraphEdge) {
    let edge = _edge as GraphEdgeImpl;

    edge.firstNode.edges.delete(edge);
    edge.secondNode.edges.delete(edge);

    return this.edges.delete(edge.key);
  }

  removeNode(_node: GraphNode) {
    let node = _node as GraphNodeImpl;

    node.edges.forEach(edge => {
      this.removeEdge(edge);
    });

    return this.nodes.delete(node.key);
  }

  getNodeByKey(key: string): GraphNode | undefined {
    return this.nodes.get(key as string);
  }

  getEdgeByKey(key: string): GraphEdge | undefined {
    return this.edges.get(key as string);
  }

  getEdgeByNodes(firstNode: GraphNode, secondNode: GraphNode) {
    return this.edges.get(GraphEdgeImpl.keyOf(firstNode, secondNode));
  }

  getNodesOfEdge(_edge: GraphEdge) {
    let edge = _edge as GraphEdgeImpl;

    let firstNode = edge.firstNode;
    let secondNode = edge.secondNode;

    return <[GraphNode, GraphNode]>[firstNode, secondNode];
  }

  getEdgesOfNode(_node: GraphNode) {
    let node = _node as GraphNodeImpl;

    let edges = node.edges;
    return edges as Set<GraphEdge>;
  }
}

class GraphEdgeExistsError extends Error {
  constructor() {
    super("An edge already exists for these two nodes");
  }
}
