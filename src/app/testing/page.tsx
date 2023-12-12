"use client";

import { useEffect, useRef } from "react";
import ScreenCanvas from "./components/ScreenCanvas";
import { MultiCanvasProvider } from "./components/CanvasProvider";
import {
  CanvasControllerName,
  createCanvasController,
} from "./components/controller";
import { screens } from "./types";
import { CanvasController } from "./components/CanvasController";
import ScreenWrapper from "./components/Screen";

export default function Page() {
  const canvasRefs = useRef<HTMLCanvasElement[]>([]);
  const exammple: CanvasControllerName = "TriangleGradientCanvas";
  let controller = useRef<CanvasController | null>(null);

  useEffect(() => {
    const canvasProvider = new MultiCanvasProvider(screens, canvasRefs);
    controller.current = createCanvasController(exammple, canvasProvider);

    return () => {
      if (controller.current) controller.current.stopLoop();
    };
  }, [exammple]);

  return (
    <>
      <div className="flex w-full h-full absolute overflow-hidden">
        <ScreenWrapper screen={screens[0]}>
          <div className="bg-slate-300">Mein Test</div>
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
      </div>
    </>
  );
}
