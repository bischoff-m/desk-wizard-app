import * as twgl from "twgl.js";
import { AnimationSettings, ScreenInfo } from "../../types";
import { ProgramState } from "./ProgramState";

export abstract class WebGLState extends ProgramState {
    public abstract meshArrays: twgl.Arrays;

    constructor(
        override screens: ScreenInfo[],
        override animationSettings: AnimationSettings,
        public vsSource: string,
        public fsSource: string
    ) {
        super(screens, animationSettings);
    }
}
