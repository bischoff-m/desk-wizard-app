import { ScreenLayout, AnimationSettings } from "../../types";
import { ProgramState } from "./ProgramState";
import * as twgl from "twgl.js";

export abstract class WebGLState extends ProgramState {
  public meshArrays: twgl.Arrays;

  constructor(
    override screenLayout: ScreenLayout,
    override animationSettings: AnimationSettings,
    public vsSource: string,
    public fsSource: string
  ) {
    super(screenLayout, animationSettings);
    this.meshArrays = this.getMeshArrays();
  }

  protected abstract getMeshArrays(): twgl.Arrays;
}
