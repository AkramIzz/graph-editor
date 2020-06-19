import { GraphNode, GraphEdge, Graph } from "./graph";

export enum GraphEventType {
  nodeAdded,
  nodeRemoved,
  edgeRemoved,
  edgeAdded
}

export type GraphEventListener = (
  type: GraphEventType,
  key: string,
  emitter: GraphEventSource
) => void;

export interface GraphEventSource {
  addNode(value?: any): GraphNode;

  addEdge(
    _firstNode: GraphNode,
    _secondNode: GraphNode,
    value?: any
  ): GraphEdge;

  removeEdge(_edge: GraphEdge): boolean;

  removeNode(_node: GraphNode): boolean;
}

export class GraphEventsStream extends Graph implements GraphEventSource {
  private listeners = new Set<GraphEventListener>();
  private afterListeners = new Set<GraphEventListener>();

  private pushEvent(
    type: GraphEventType,
    key: string,
    emitter: GraphEventSource
  ) {
    console.log(`pushing event: ${type}, key: ${key}, emitter: ${emitter}`);

    this.listeners.forEach(listener => {
      listener(type, key, emitter);
    });

    this.afterListeners.forEach(listener => {
      listener(type, key, emitter);
    });
  }

  addListener(listener: GraphEventListener) {
    this.listeners.add(listener);
  }

  addAfterListener(listener: GraphEventListener) {
    this.afterListeners.add(listener);
  }

  addNode(value?: any, emitter?: GraphEventSource) {
    let node = super.addNode(value);
    this.pushEvent(GraphEventType.nodeAdded, node.key, emitter || this);
    return node;
  }

  addEdge(
    _firstNode: GraphNode,
    _secondNode: GraphNode,
    value?: any,
    emitter?: GraphEventSource
  ) {
    let edge = super.addEdge(_firstNode, _secondNode, value);
    this.pushEvent(GraphEventType.edgeAdded, edge.key, emitter || this);
    return edge;
  }

  removeEdge(_edge: GraphEdge, emitter?: GraphEventSource) {
    if (super.removeEdge(_edge)) {
      this.pushEvent(GraphEventType.edgeRemoved, _edge.key, emitter || this);
      return true;
    } else {
      return false;
    }
  }

  removeNode(_node: GraphNode, emitter?: GraphEventSource) {
    if (super.removeNode(_node)) {
      this.pushEvent(GraphEventType.nodeRemoved, _node.key, emitter || this);
      return true;
    } else {
      return false;
    }
  }
}
