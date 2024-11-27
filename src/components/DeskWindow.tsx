import { cn } from "@/lib/utils";
import {
    ResizeEnable,
    Rnd,
    RndDragCallback,
    RndResizeCallback,
    RndResizeStartCallback,
} from "react-rnd";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

type Size = {
    width: string | number;
    height: string | number;
};

interface DeskWindowProps {
    children: React.ReactNode;
    onClosed?: () => void;
    // Forwards all other props to react-rnd
    default?: {
        x: number;
        y: number;
    } & Size;
    position?: {
        x: number;
        y: number;
    };
    size?: Size;
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
    const windowRoot = document.getElementById("desk-window-root");
    // DOM not ready yet (I guess)
    if (!windowRoot) return <></>;

    // Remove the onClosed prop from the props object
    const rndProps = { ...props };
    delete rndProps.onClosed;
    delete rndProps.children;

    return createPortal(
        <Rnd
            {...rndProps}
            dragHandleClassName="drag-handle"
            className={cn("rounded-lg", "text-primary", "overflow-hidden")}
            style={{
                background: "rgba(0, 0, 0, 0.36)",
                borderRadius: "16px",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                backdropFilter: "blur(15px)",
                WebkitBackdropFilter: "blur(15px)",
                border: "1px solid rgba(0, 0, 0, 0.3)",
            }}
        >
            <div className="flex flex-row h-8 justify-end items-center hover:bg-black hover:bg-opacity-10">
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
            <div className="p-3">{props.children}</div>
        </Rnd>,
        windowRoot
    );
}
