import { useEffect, useRef } from "react";
import { screens } from "../types";
import { MultiCanvasProvider } from "./CanvasProvider";
import { Control } from "./controlClasses";

const PROGRAM = Control.Waves.create();

/**
 * This component is used to make the page reload when editing the control in
 * development mode. I think React needs a component for that, but there is likely a
 * better way.
 */
export default function ControlProvider({
  ...props
}: {
  children?: React.ReactNode;
  canvasRefs: React.MutableRefObject<HTMLCanvasElement[]>;
}) {
  const multiCanvasRef = useRef<MultiCanvasProvider | null>(null);

  useEffect(() => {
    if (multiCanvasRef.current) {
      multiCanvasRef.current.destroy();
    }
    multiCanvasRef.current = new MultiCanvasProvider(
      PROGRAM,
      screens,
      props.canvasRefs
    );

    return () => {
      if (multiCanvasRef.current) {
        multiCanvasRef.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{props.children}</>;
}
