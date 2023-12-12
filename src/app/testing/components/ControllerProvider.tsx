import { useEffect, useRef } from "react";
import { screens } from "../types";
import { CanvasController } from "./CanvasController";
import { MultiCanvasProvider } from "./CanvasProvider";
import { Controller } from "./controllerClasses";

/**
 * This component is used to make the page reload when editing the controller in
 * development mode. I think React needs a component for that, but there is likely a
 * better way.
 */
export default function ControllerProvider({
  ...props
}: {
  children?: React.ReactNode;
  canvasRefs: React.MutableRefObject<HTMLCanvasElement[]>;
}) {
  const multiCanvasRef = useRef<MultiCanvasProvider | null>(null);
  const controllerRef = useRef<CanvasController | null>(null);

  function initController() {
    if (multiCanvasRef.current === null) return;
    if (controllerRef.current !== null) controllerRef.current.stopLoop();
    // ##########################################

    // controllerRef.current = new Controller.PictureFrame(
    //   multiCanvasRef.current,
    //   "/Panorama Skiurlaub.png"
    // );
    controllerRef.current = new Controller.Bubbles(multiCanvasRef.current);
    // controllerRef.current = new Controller.CalibrationGrid(
    //   multiCanvasRef.current
    // );

    // ##########################################
    controllerRef.current.run();
  }

  initController();

  useEffect(() => {
    multiCanvasRef.current = new MultiCanvasProvider(screens, props.canvasRefs);
    initController();
  }, [props.canvasRefs]);

  return <>{props.children}</>;
}
