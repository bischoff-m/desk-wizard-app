import React, { useEffect, useRef } from "react";
import { Screen } from "../types";
import { CanvasProgram } from "./classes/CanvasProgram";
import { CanvasProvider } from "./classes/canvas/CanvasProvider";
import { MultiCanvasProvider } from "./classes/canvas/MultiCanvasProvider";
import { SingleCanvasProvider } from "./classes/canvas/SingleCanvasProvider";

export function useCanvas(
  screens: Screen[],
  program: CanvasProgram<any>,
  root?: HTMLElement
): {
  canvasProvider: CanvasProvider | null;
  ScreenWrapper: React.FunctionComponent<Parameters<typeof ScreenWrapper>[0]>;
} {
  const providerRef = useRef<CanvasProvider | null>(null);
  const canvasRefs = useRef<HTMLCanvasElement[]>([]);

  function ScreenWrapper(props: {
    screenId: number;
    children?: React.ReactNode;
  }) {
    const { screenId, children } = props;
    return (
      <div
        className="absolute"
        style={{
          left: screens[screenId].pageSize.topLeft.x,
          top: screens[screenId].pageSize.topLeft.y,
          width: screens[screenId].pageSize.w,
          height: screens[screenId].pageSize.h,
          backgroundImage: "url('/annapurna-massif.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <main className="screen-wrapper flex flex-row justify-center items-center h-full w-full">
          {children}
          {program.canvasPlacement === "per-screen" && (
            <canvas
              className="screen-canvas absolute w-full h-full"
              width={screens[screenId].screenSize.w}
              height={screens[screenId].screenSize.h}
            />
          )}
        </main>
      </div>
    );
  }

  useEffect(() => {
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    const newRoot = root || document.body;
    const screenElements = newRoot.querySelectorAll(".screen-wrapper");
    if (screenElements.length === 0) {
      console.error("No ScreenWrapper components found");
      return;
    }

    // Initialize canvasRefs
    if (canvasRefs.current.length === 0) initCanvasRefs(screenElements);

    if (!providerRef.current) initCanvasProvider();

    return () => {
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initCanvasRefs(screenElements: NodeListOf<Element>) {
    if (program.canvasPlacement === "per-screen") {
      for (const screenEl of screenElements) {
        // Assure that every screen has exactly one canvas
        const canvas = screenEl.querySelectorAll(".screen-canvas");
        if (canvas.length !== 1) {
          throw new Error(
            "Every ScreenWrapper must have exactly one .screen-canvas child"
          );
        }
        // Add canvas to canvasRefs
        canvasRefs.current.push(canvas[0] as HTMLCanvasElement);
      }
    } else if (program.canvasPlacement === "spanning") {
      throw new Error("Not implemented yet");
    } else {
      throw new Error("Invalid CanvasProgram.canvasPlacement");
    }
  }

  function initCanvasProvider() {
    if (program.canvasPlacement === "per-screen") {
      if (canvasRefs.current.length > 1)
        providerRef.current = new MultiCanvasProvider(
          program,
          screens,
          canvasRefs.current
        );
      else
        providerRef.current = new SingleCanvasProvider(
          program,
          canvasRefs.current[0]
        );
    } else if (program.canvasPlacement === "spanning") {
      throw new Error("Not implemented yet");
    } else {
      throw new Error("Invalid CanvasProgram.canvasPlacement");
    }
  }

  return { canvasProvider: providerRef.current, ScreenWrapper };
}
