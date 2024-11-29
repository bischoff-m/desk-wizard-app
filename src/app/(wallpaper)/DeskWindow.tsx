import { cn } from "@/lib/utils";
import {
    ResizeEnable,
    Rnd,
    RndDragCallback,
    RndResizeCallback,
    RndResizeStartCallback,
} from "react-rnd";
import { X } from "lucide-react";
import { produce } from "immer";
import ClientOnlyPortal from "@/components/ClientOnlyPortal";
import { useEffect, useRef, useState } from "react";

interface WindowState {
    x: number;
    y: number;
    width: number;
    height: number | null;
}

interface DeskWindowProps {
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

export default function DeskWindow(props: DeskWindowProps) {
    const [windowState, setWindowState] = useState<WindowState>({
        x: 0,
        y: 0,
        width: 800,
        height: null,
    });
    const rndRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setWindowState(
            produce(windowState, (draft) => {
                if (!props.default) return draft;
                draft.x = props.default.x || draft.x;
                draft.y = props.default!.y || draft.y;
                draft.width = props.default!.width || draft.width;
                draft.height = props.default!.height || draft.height;
            })
        );
    }, [props.default]);

    return (
        <ClientOnlyPortal selector="#desk-window-root">
            <Rnd
                className={cn("rounded-xl", "text-primary", "overflow-hidden")}
                style={{
                    background: "rgba(0, 0, 0, 0.45)",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                    backdropFilter: "blur(25px)",
                    WebkitBackdropFilter: "blur(25px)",
                    border: "1px solid rgba(0, 0, 0, 0.3)",
                }}
                dragHandleClassName="drag-handle"
                size={{ width: windowState.width, height: windowState.height || "auto" }}
                position={{ x: windowState.x, y: windowState.y }}
                onDragStop={(e, d) => {
                    setWindowState(
                        produce(windowState, (draft) => {
                            draft.x = d.x;
                            draft.y = d.y;
                        })
                    );
                    props.onDragStop?.(e, d);
                }}
                onResize={(e, direction, ref, delta, position) => {
                    setWindowState({
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
                            "hover:bg-opacity-10"
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
                                "hover:bg-red-600"
                            )}
                            onClick={props.onClosed}
                        >
                            <X />
                        </div>
                    </div>
                    <div className="p-3 w-full flex-1" ref={contentRef}>
                        {props.children}
                    </div>
                </div>
            </Rnd>
        </ClientOnlyPortal>
    );
}
