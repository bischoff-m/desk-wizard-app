"use client";

import { useCanvas } from "./components/ProgramProvider";
import { screens } from "./types";
import { Control } from "./classes/programs";

export default function Page() {
  const { ScreenWrapper } = useCanvas(
    screens,
    Control.Waves.create()
    // Control.PictureFrame.create("Panorama Skiurlaub.png")
  );

  return (
    <>
      <div className="flex w-full h-full absolute overflow-hidden">
        <ScreenWrapper screenId={0}>
          <div className="bg-slate-300">{/* Placeholer */}</div>
        </ScreenWrapper>

        <ScreenWrapper screenId={1}></ScreenWrapper>

        <ScreenWrapper screenId={2}></ScreenWrapper>
      </div>
    </>
  );
}
