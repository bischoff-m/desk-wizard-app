import React, { useEffect, useRef } from "react";
import { CanvasProgram } from "../classes/CanvasProgram";
import { CanvasProvider } from "../classes/canvas/CanvasProvider";
import { PerScreenCanvasProvider } from "../classes/canvas/PerScreenCanvasProvider";
import { SpanningCanvasProvider } from "../classes/canvas/SpanningCanvasProvider";
import { ScreenInfo } from "../types";

function assertNumberOfScreenChildren(number: number, root: Element) {
  const canvasElements = root.querySelectorAll(".screen-canvas");
  if (canvasElements.length !== number) {
    throw new Error(
      `Expected ${number} ScreenWrapper, but found ${canvasElements.length}`
    );
  }
}

export function useCanvas(
  screens: ScreenInfo[],
  program: CanvasProgram<any, any>,
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
    if (screenId < 0 || screenId >= screens.length)
      throw new Error(`Screen ID ${screenId} out of range`);
    return (
      <div
        className="absolute"
        style={{
          left: screens[screenId].boundingRect.x,
          top: screens[screenId].boundingRect.y,
          width: screens[screenId].boundingRect.w,
          height: screens[screenId].boundingRect.h,
          ...(program.placement === "per-screen"
            ? {
                backgroundImage: "url('/annapurna-massif.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}),
        }}
      >
        <main className="screen-wrapper flex flex-row justify-center items-center h-full w-full">
          {children}
          {program.placement === "per-screen" && (
            <canvas
              className="screen-canvas absolute w-full h-full"
              width={screens[screenId].realSize.w}
              height={screens[screenId].realSize.h}
            />
          )}
        </main>
      </div>
    );
  }

  useEffect(() => {
    const placement = program.placement;
    const newRoot = root || document.body;
    const screenElements = newRoot.querySelectorAll(".screen-wrapper");

    // Test preconditions
    if (screenElements.length === 0)
      throw new Error("No ScreenWrapper components found");
    if (screenElements.length > screens.length)
      throw new Error(
        `Expected at most ${screens.length} ScreenWrapper, but found ${screenElements.length}`
      );
    if (placement !== "per-screen" && placement !== "spanning")
      throw new Error("Invalid CanvasProgram.placement");

    // Initialize canvasRefs
    if (canvasRefs.current.length === 0) {
      if (placement === "per-screen") {
        for (const screenEl of screenElements) {
          assertNumberOfScreenChildren(1, screenEl);
          // Add canvas to canvasRefs
          const canvas = screenEl.querySelectorAll(".screen-canvas");
          canvasRefs.current.push(canvas[0] as HTMLCanvasElement);
        }
      } else {
        for (const screenEl of screenElements)
          assertNumberOfScreenChildren(0, screenEl);
        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.classList.add("screen-canvas", "absolute");
        canvasRefs.current.push(canvas);

        // Set canvas size to total size of all screens
        const minX = Math.min(...screens.map((s) => s.boundingRect.x));
        const minY = Math.min(...screens.map((s) => s.boundingRect.y));
        const maxX = Math.max(
          ...screens.map((s) => s.boundingRect.x + s.boundingRect.w)
        );
        const maxY = Math.max(
          ...screens.map((s) => s.boundingRect.y + s.boundingRect.h)
        );
        canvas.style.left = `${minX}px`;
        canvas.style.top = `${minY}px`;
        canvas.width = maxX - minX;
        canvas.height = maxY - minY;

        // Add canvas to root
        newRoot.prepend(canvas);
      }
    }

    // Initialize canvasProvider
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (placement === "per-screen") {
      providerRef.current = new PerScreenCanvasProvider(
        program,
        canvasRefs.current,
        screens
      );
    } else {
      providerRef.current = new SpanningCanvasProvider(
        program,
        canvasRefs.current[0],
        screens
      );
    }

    return () => {
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { canvasProvider: providerRef.current, ScreenWrapper };
}
