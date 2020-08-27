import {
  GraphEventType,
  GraphEventSource,
  GraphEventListener,
  GraphEventsStream
} from "../event";
import { Graph, GraphNode, GraphEdge } from "../graph";
import { GraphEngine } from "../engine";

export abstract class GraphSystem {
  graph: GraphEventsSharedDispatchListener;

  constructor(public readonly engine: GraphEngine, _graph: GraphEventsStream) {
    this.graph = new GraphEventsSharedDispatchListener(this, _graph);
  }

  abstract init(): void;

  start(): void {}

  stop(): void {}

  abstract update(): void;

  abstract onEvent(type: GraphEventType, key: string): void;

  onAfterEvent(type: GraphEventType, key: string): void {}

  restart(graph: GraphEventsStream) {
    this.stop();
    this.graph = new GraphEventsSharedDispatchListener(this, graph);
    this.start();
  }
}

export abstract class GraphSystemWithHooks<HookType> extends GraphSystem {
  readonly hooks: Array<HookType>;

  constructor(engine: GraphEngine, graph: GraphEventsStream) {
    super(engine, graph);
    this.hooks = [];
  }

  registerHook(hook: HookType) {
    this.hooks.push(hook);
  }
}

class GraphEventsSharedDispatchListener implements Graph {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;

  constructor(private sink: GraphSystem, private source: GraphEventsStream) {
    this.nodes = source.nodes;
    this.edges = source.edges;
    source.addListener(this.onEvent.bind(this));
    source.addAfterListener(this.onAfterEvent.bind(this));
  }

  private onEvent(
    type: GraphEventType,
    key: string,
    emitter: GraphEventSource
  ): void {
    if (emitter !== this) {
      this.sink.onEvent(type, key);
    }
  }

  private onAfterEvent(
    type: GraphEventType,
    key: string,
    emitter: GraphEventSource
  ): void {
    if (emitter !== this) {
      this.sink.onAfterEvent(type, key);
    }
  }

  addNode(value?: any): GraphNode {
    return this.source.addNode(value, this);
  }

  addEdge(
    _firstNode: GraphNode,
    _secondNode: GraphNode,
    value?: any
  ): GraphEdge {
    return this.source.addEdge(_firstNode, _secondNode, value, this);
  }

  removeEdge(_edge: GraphEdge): boolean {
    return this.source.removeEdge(_edge, this);
  }

  removeNode(_node: GraphNode): boolean {
    return this.source.removeNode(_node, this);
  }

  addListener(listener: GraphEventListener): void {
    this.source.addListener(listener);
  }

  addAfterListener(listener: GraphEventListener): void {
    this.source.addAfterListener(listener);
  }

  getNodeByKey(key: string): GraphNode | undefined {
    return this.source.getNodeByKey(key);
  }

  getEdgeByKey(key: string): GraphEdge | undefined {
    return this.source.getEdgeByKey(key);
  }

  getEdgeByNodes(
    firstNode: GraphNode,
    secondNode: GraphNode
  ): GraphEdge | undefined {
    return this.source.getEdgeByNodes(firstNode, secondNode);
  }

  getNodesOfEdge(_edge: GraphEdge): [GraphNode, GraphNode] {
    return this.source.getNodesOfEdge(_edge);
  }

  getEdgesOfNode(_node: GraphNode): Set<GraphEdge> {
    return this.source.getEdgesOfNode(_node);
  }
}
