"use client";

import { useRef } from "react";
import ControllerProvider from "./components/ControllerProvider";
import ScreenWrapper from "./components/Screen";
import ScreenCanvas from "./components/ScreenCanvas";
import { screens } from "./types";

export default function Page() {
  const canvasRefs = useRef<HTMLCanvasElement[]>([]);

  return (
    <>
      <div className="flex w-full h-full absolute overflow-hidden">
        <ControllerProvider
          // controller={controller.current}
          // controllerClass={Controller.PictureFrame}
          canvasRefs={canvasRefs}
        >
          <ScreenWrapper screen={screens[0]}>
            <div className="bg-slate-300">{/* Placeholer */}</div>
            <ScreenCanvas
              screen={screens[0]}
              ref={(el) => el && (canvasRefs.current[0] = el)}
            />
          </ScreenWrapper>

          <ScreenWrapper screen={screens[1]}>
            <ScreenCanvas
              screen={screens[1]}
              ref={(el) => el && (canvasRefs.current[1] = el)}
            />
          </ScreenWrapper>

          <ScreenWrapper screen={screens[2]}>
            <ScreenCanvas
              screen={screens[2]}
              ref={(el) => el && (canvasRefs.current[2] = el)}
            />
          </ScreenWrapper>
        </ControllerProvider>
      </div>
    </>
  );
}
