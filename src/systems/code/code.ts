import { GraphSystem } from "../system";
import { GraphEventType } from "../../event";
import CodeMirror from "codemirror";

export class GraphCodeEditorSystem extends GraphSystem {
  public editor: CodeMirror.Editor = (window as any).editor;

  private _shouldReplayOnEvents = false;
  private get shouldReplayOnEvents() { return this._shouldReplayOnEvents };
  private set shouldReplayOnEvents(value: boolean) {
    if (value == true) {
      document.getElementById("replayButton")!.style.color = "#909090";
    } else {
      document.getElementById("replayButton")!.style.color = "#000000 ";
    }
    this._shouldReplayOnEvents = value;
  }

  init() {
    document.getElementById("evalButton")!.onclick = () => {
      eval(this.editor.getValue());
    };

    document.getElementById("replayButton")!.onclick = () => {
      this.shouldReplayOnEvents = !this.shouldReplayOnEvents;
    }
  }

  update() { }

  onEvent(type: GraphEventType, key: string): void {
    if (this.shouldReplayOnEvents) {
      eval(this.editor.getValue());
    }
  }
}
