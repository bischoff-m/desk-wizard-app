import { useEffect, useRef } from "react";
import { screens } from "../types";
import { MultiCanvasProvider } from "./CanvasProvider";
import { Control } from "./controlClasses";

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

  function initControl() {
    if (multiCanvasRef.current) {
      multiCanvasRef.current.destroy();
    }
    multiCanvasRef.current = new MultiCanvasProvider(
      Control.Bubbles.create(),
      screens,
      props.canvasRefs
    );
  }

  // TODO: Fix hot reloading
  // initControl();

  useEffect(() => {
    requestAnimationFrame(() => {
      initControl();
    });
    return () => {
      if (multiCanvasRef.current) {
        multiCanvasRef.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{props.children}</>;
}
