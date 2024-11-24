import { cn } from "@/lib/utils";
import { Rnd } from "react-rnd";
import { X } from "lucide-react";

export default function DeskWindow(props: {
    children: React.ReactNode;
    onClosed?: () => void;
    x: number;
    y: number;
    width: number;
    height: number;
}) {
    return (
        <Rnd
            default={{
                x: props.x,
                y: props.y,
                width: props.width,
                height: props.height,
            }}
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
        </Rnd>
    );
}
