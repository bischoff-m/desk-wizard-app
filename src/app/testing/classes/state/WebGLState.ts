import { ScreenLayout, AnimationSettings } from "../../types";
import { ProgramState } from "../ProgramState";

export abstract class WebGLState extends ProgramState {
  protected programInfo: any;
  protected bufferInfo: any[];

  constructor(
    override screenLayout: ScreenLayout,
    override animationSettings: AnimationSettings
  ) {
    super(screenLayout, animationSettings);
    this.programInfo = null;
    this.bufferInfo = [];
  }
}
