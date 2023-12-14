"use client";

import { useRef } from "react";
import ControlProvider from "./components/ControlProvider";
import ScreenWrapper from "./components/Screen";
import ScreenCanvas from "./components/ScreenCanvas";
import { screens } from "./types";

export default function Page() {
  const canvasRefs = useRef<HTMLCanvasElement[]>([]);

  return (
    <>
      <div className="flex w-full h-full absolute overflow-hidden">
        <ControlProvider
          // control={control.current}
          // controlClass={Control.PictureFrame}
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
        </ControlProvider>
      </div>
    </>
  );
}
