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
    multiCanvasRef.current = new MultiCanvasProvider(
      (canvas, requestUpdate) => {
        // return new Control.PictureFrame(
        //   canvas,
        //   requestUpdate,
        //   "/Panorama Skiurlaub.png"
        // );
        return new Control.Bubbles(canvas, requestUpdate);
      },
      screens,
      props.canvasRefs
    );
    // screens, props.canvasRefs);
    // ##########################################

    // controlRef.current = new Control.PictureFrame(
    //   multiCanvasRef.current,
    //   "/Panorama Skiurlaub.png"
    // );
    // controlRef.current = new Control.Bubbles(multiCanvasRef.current);
    // controlRef.current = new Control.CalibrationGrid(
    //   multiCanvasRef.current
    // );

    // ##########################################
  }

  initControl();

  useEffect(() => {
    initControl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{props.children}</>;
}
