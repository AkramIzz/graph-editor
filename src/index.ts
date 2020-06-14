import { GraphEngine } from "./engine";

GraphEngine.instance.run();

(window as any).engine = GraphEngine.instance;
