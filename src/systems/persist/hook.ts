export abstract class GraphPersistenceHook {
  abstract get name(): string;
  abstract serializeSystem(): any | undefined;
  abstract serializeNode(key: string): any | undefined;
  abstract serializeEdge(key: string): any | undefined;
  abstract deserializeSystem(data: any | undefined): void;
  abstract deserializeNode(key: string, data: any | undefined): void;
  abstract deserializeEdge(key: string, data: any | undefined): void;
}
