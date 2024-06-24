import React, { useEffect, useRef, useState } from "react";
import { CanvasProgram } from "../classes/CanvasProgram";
import { CanvasProvider } from "../classes/canvas/CanvasProvider";
import { PerScreenCanvasProvider } from "../classes/canvas/PerScreenCanvasProvider";
import { SpanningCanvasProvider } from "../classes/canvas/SpanningCanvasProvider";
import { ScreenInfo } from "../types";
import { ProgramState } from "../classes/state/ProgramState";
import DebugInfo from "./DebugInfo";
import { mergeRects } from "../classes/ScreenInfo";

function assertNumberOfScreenChildren(number: number, root: Element) {
  const canvasElements = root.querySelectorAll(".screen-canvas");
  if (canvasElements.length !== number) {
    throw new Error(
      `Expected ${number} ScreenWrapper, but found ${canvasElements.length}`
    );
  }
}

export function useCanvas<TState extends ProgramState>(
  screens: ScreenInfo[],
  program: CanvasProgram<TState, any>,
  root?: HTMLElement
): {
  canvasProvider: CanvasProvider<TState> | null;
  ScreenWrapper: React.FunctionComponent<Parameters<typeof ScreenWrapper>[0]>;
} {
  const providerRef = useRef<CanvasProvider<TState> | null>(null);
  const canvasRefs = useRef<HTMLCanvasElement[]>([]);
  const onLoadListeners = useRef<(() => void)[]>([]);

  function ScreenWrapper(props: {
    children?: React.ReactNode;
    screenId: number;
    showDebug?: boolean;
  }): JSX.Element {
    const { children, screenId, showDebug } = props;
    if (screenId < 0 || screenId >= screens.length)
      throw new Error(`Screen ID ${screenId} out of range`);

    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
      let onLoad = () => {
        setIsInitialized(providerRef.current !== null);
      };
      onLoadListeners.current.push(onLoad);
      return () => {
        const idx = onLoadListeners.current.indexOf(onLoad);
        if (idx >= 0) onLoadListeners.current.splice(idx, 1);
        setIsInitialized(false);
      };
    }, []);

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
          {isInitialized && showDebug && (
            <DebugInfo sharedState={providerRef.current!.sharedState} />
          )}
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
        const totalSize = mergeRects(screens.map((s) => s.boundingRect));
        const scaledSize = mergeRects(screens.map((s) => s.scaledRect));
        canvas.width = scaledSize.w;
        canvas.height = scaledSize.h;
        canvas.style.left = `${totalSize.x}px`;
        canvas.style.top = `${totalSize.y}px`;
        canvas.style.width = `${totalSize.w}px`;
        canvas.style.height = `${totalSize.h}px`;
        // Set pixelated rendering
        canvas.style.imageRendering = "pixelated";

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
    for (const listener of onLoadListeners.current) listener();

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
