import { GraphSystem } from "../system";
import { GraphEventType } from "../../event";

export class GraphHistorySystem extends GraphSystem {
  private textarea = document.getElementById(
    "graph-text"
  ) as HTMLTextAreaElement;
  private get source() {
    return this.textarea.value;
  }
  private set source(value: string) {
    this.textarea.value = value;
  }

  get history() {
    return this.source.split("\n");
  }

  init() {
    this.source = "";
    this.textarea.addEventListener("input", () => {
      this.source = this.source.substring(0, this.source.length - 1);
    });
  }

  update() {}

  onEvent(type: GraphEventType, key: string): void {
    switch (type) {
      case GraphEventType.nodeAdded:
      case GraphEventType.edgeAdded:
        this.source = "added: " + key + "\n" + this.source;
        break;
      case GraphEventType.nodeRemoved:
      case GraphEventType.edgeRemoved:
        this.source = "removed: " + key + "\n" + this.source;
        break;
    }
  }
}
