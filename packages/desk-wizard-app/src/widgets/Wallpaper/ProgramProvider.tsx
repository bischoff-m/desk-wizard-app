import React, { useEffect, useRef, useState } from "react";
import { CanvasProgram } from "./classes/CanvasProgram";
import { CanvasProvider } from "./classes/canvas/CanvasProvider";
import { PerScreenCanvasProvider } from "./classes/canvas/PerScreenCanvasProvider";
import { SpanningCanvasProvider } from "./classes/canvas/SpanningCanvasProvider";
import { ScreenInfo } from "./types";
import { ProgramState } from "./classes/state/ProgramState";
import DebugInfo from "./DebugInfo";
import { mergeRects } from "./classes/ScreenInfo";
import { cn } from "@/lib/utils";

function assertNumberOfScreenChildren(number: number, root: Element) {
  const canvasElements = root.querySelectorAll(".screen-canvas");
  if (canvasElements.length !== number) {
    throw new Error(
      `Expected ${number} ScreenWrapper, but found ${canvasElements.length}`,
    );
  }
}

export function ScreenWrapper(props: {
  children?: React.ReactNode;
  screenId: number;
  showDebug?: boolean;
  screens: ScreenInfo[];
  program: CanvasProgram<ProgramState, any> | null;
  provider: CanvasProvider<ProgramState> | null;
}): React.JSX.Element {
  const { children, screenId, showDebug } = props;
  if (screenId < 0 || screenId >= props.screens.length)
    throw new Error(`Screen ID ${screenId} out of range`);

  return (
    <div
      className="absolute"
      style={{
        left: props.screens[screenId].boundingRect.x,
        top: props.screens[screenId].boundingRect.y,
        width: props.screens[screenId].boundingRect.w,
        height: props.screens[screenId].boundingRect.h,
      }}
    >
      <main
        className={cn(
          "screen-wrapper",
          "flex",
          "flex-row",
          "justify-center",
          "items-center",
          "h-full",
          "w-full",
        )}
      >
        {showDebug && props.provider && (
          <DebugInfo sharedState={props.provider.sharedState} />
        )}
        {props.program?.placement === "per-screen" && (
          <canvas
            className="screen-canvas absolute w-full h-full -z-50"
            width={props.screens[screenId].realSize.w}
            height={props.screens[screenId].realSize.h}
          />
        )}
        {children}
      </main>
    </div>
  );
}

export function useCanvas<TState extends ProgramState>(
  screens: ScreenInfo[],
  program?: CanvasProgram<TState, any> | null,
  root?: HTMLElement,
): {
  canvasProvider: CanvasProvider<TState> | null;
} {
  const [provider, setProvider] = useState<CanvasProvider<TState> | null>(null);
  const canvasRefs = useRef<HTMLCanvasElement[]>([]);

  useEffect(() => {
    if (!program) return;

    const placement = program.placement;
    const newRoot = root || document.body;
    const screenElements = newRoot.querySelectorAll(".screen-wrapper");

    // Test preconditions
    if (screenElements.length === 0) throw new Error("No ScreenWrapper components found");
    if (screenElements.length > screens.length)
      throw new Error(
        `Expected at most ${screens.length} ScreenWrapper, but found ${screenElements.length}`,
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
        for (const screenEl of screenElements) assertNumberOfScreenChildren(0, screenEl);
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
    if (!provider) {
      if (placement === "per-screen")
        setProvider(new PerScreenCanvasProvider(program, canvasRefs.current, screens));
      else
        setProvider(new SpanningCanvasProvider(program, canvasRefs.current[0], screens));
    }

    return () => {
      if (provider) {
        provider.destroy();
        setProvider(null);
      }
    };
  }, [program, screens, root, provider]);

  return {
    canvasProvider: provider,
  };
}
