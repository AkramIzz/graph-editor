import { GraphSystem } from "../system";
import { GraphEventType } from "../../event";

export class GraphDSLSystem extends GraphSystem {
    init() { }

    update() { }

    onEvent(type: GraphEventType, key: string): void { }
}