import { forwardRef } from "react";
import { Screen } from "../types";

const ScreenCanvas = forwardRef<HTMLCanvasElement, { screen: Screen }>(
  function ScreenCanvas(props, ref) {
    const { screenSize } = props.screen;

    return (
      <canvas
        ref={ref}
        className="screen-canvas absolute w-full h-full"
        width={screenSize.w}
        height={screenSize.h}
      />
    );
  }
);

export default ScreenCanvas;
