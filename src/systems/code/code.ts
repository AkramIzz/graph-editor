import { GraphSystem } from "../system";
import { GraphEventType } from "../../event";


export class GraphCodeEditorSystem extends GraphSystem {
    public editor = ace.edit("editor");

    init() {
        this.editor.setTheme("ace/theme/twilight");
        this.editor.session.setMode("ace/mode/python");
    }

    update() {
        this.editor.resize();
    }

    onEvent(type: GraphEventType, key: string): void { }
}
