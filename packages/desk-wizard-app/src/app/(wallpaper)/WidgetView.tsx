import { cn } from "@/lib/utils";
import {
  type ResizeEnable,
  Rnd,
  type RndDragCallback,
  type RndResizeCallback,
  type RndResizeStartCallback,
} from "react-rnd";
import { ChevronUp, X } from "lucide-react";
import { produce } from "immer";
import { useEffect, useRef, useState } from "react";

interface WidgetState {
  x: number;
  y: number;
  width: number;
  height: number | null;
}

interface WidgetViewProps {
  children: React.ReactNode;
  onClosed?: () => void;
  default?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number | null;
  };
  onMouseDown?: (e: MouseEvent) => void;
  onMouseUp?: (e: MouseEvent) => void;
  onResizeStart?: RndResizeStartCallback;
  onResize?: RndResizeCallback;
  onResizeStop?: RndResizeCallback;
  onDragStart?: RndDragCallback;
  onDrag?: RndDragCallback;
  onDragStop?: RndDragCallback;
  enableResizing?: ResizeEnable;
  maxHeight?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  minWidth?: number | string;
  disableDragging?: boolean;
  allowAnyClick?: boolean;
}

export default function WidgetView(props: WidgetViewProps) {
  const [widgetState, setWidgetState] = useState<WidgetState>({
    x: 100,
    y: 700,
    width: 800,
    height: null,
  });
  const [showTitleBar, setShowTitleBar] = useState(true);
  const rndRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setWidgetState(
      produce(widgetState, (draft) => {
        if (!props.default) return draft;
        draft.x = props.default.x || draft.x;
        draft.y = props.default!.y || draft.y;
        draft.width = props.default!.width || draft.width;
        draft.height = props.default!.height || draft.height;
        return draft;
      }),
    );
  }, [props.default]);

  return (
    <Rnd
      className={cn("rounded-xl", "text-primary", "overflow-hidden")}
      style={{
        background: "rgba(0, 0, 0, 0)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(42px)",
        WebkitBackdropFilter: "blur(42px)",
        border: "1px solid rgba(200, 200, 200, 0.15)",
      }}
      dragHandleClassName="drag-handle"
      size={{ width: widgetState.width, height: widgetState.height || "auto" }}
      position={{ x: widgetState.x, y: widgetState.y }}
      onDragStop={(e, d) => {
        setWidgetState(
          produce(widgetState, (draft) => {
            draft.x = d.x;
            draft.y = d.y;
          }),
        );
        props.onDragStop?.(e, d);
      }}
      onResize={(e, direction, ref, delta, position) => {
        setWidgetState({
          x: position.x,
          y: position.y,
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        });
        props.onResize?.(e, direction, ref, delta, position);
      }}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
      onResizeStart={props.onResizeStart}
      onResizeStop={(e, direction, ref, delta, position) => {
        props.onResizeStop?.(e, direction, ref, delta, position);
      }}
      onDragStart={props.onDragStart}
      onDrag={props.onDrag}
      enableResizing={props.enableResizing}
      maxHeight={props.maxHeight}
      maxWidth={props.maxWidth}
      minHeight={props.minHeight}
      minWidth={props.minWidth}
      disableDragging={props.disableDragging}
      allowAnyClick={props.allowAnyClick}
    >
      <div className={cn("w-full", "h-full", "flex", "flex-col")}>
        {showTitleBar ? (
          <div
            ref={rndRef}
            className={cn(
              "flex-none",
              "flex",
              "flex-row",
              "h-8",
              "justify-end",
              "items-center",
              "hover:bg-black",
              "hover:bg-opacity-10",
            )}
          >
            <div className="drag-handle flex-1 h-full" />
            <div
              className={cn(
                "flex",
                "justify-center",
                "items-center",
                "w-12",
                "h-full",
                "hover:bg-slate-600",
              )}
              onClick={() => {
                setShowTitleBar(false);
              }}
            >
              <ChevronUp />
            </div>
            <div
              className={cn(
                "flex",
                "justify-center",
                "items-center",
                "w-12",
                "h-full",
                "hover:bg-red-500",
              )}
              onClick={props.onClosed}
            >
              <X />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "absolute",
              "top-0",
              "left-1/2",
              "h-6",
              "w-20",
              "translate-x-[-50%]",
            )}
          >
            <div
              className={cn("absolute", "w-20", "h-3", "bg-slate-600")}
              style={{
                mask: "radial-gradient(0.75rem at 0 0.75rem, transparent 98%, black) 0/51% 100% no-repeat, radial-gradient(0.75rem at 100% 0.75rem, transparent 98%, black) 100%/51% 100% no-repeat",
              }}
            />
            <div
              className={cn(
                "absolute",
                "left-3",
                "h-6",
                "w-14",
                "bg-slate-600",
                "rounded-full",
              )}
            />
            <div
              className={cn(
                "absolute",
                "top-1/2",
                "left-1/2",
                "w-8",
                "h-4",
                "bg-slate-500",
                "rounded-full",
                "transform",
                "-translate-x-1/2",
                "-translate-y-1/2",
                "hover:bg-slate-300",
              )}
              onClick={() => setShowTitleBar(true)}
            />
          </div>
          // <div className="absolute top-0 left-1/2 h-6 w-8 bg-red-600" />
        )}
        <div className="p-3 w-full flex-1" ref={contentRef}>
          {props.children}
        </div>
      </div>
    </Rnd>
  );
}
