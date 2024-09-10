"use client";

import { Control } from "./wallpaper/classes/programs";
import { loadScreens } from "./wallpaper/classes/ScreenInfo";
import { useCanvas } from "./wallpaper/components/ProgramProvider";

export default function Home() {
  const { ScreenWrapper } = useCanvas(
    loadScreens(),
    Control.PictureFrame.create(
      "pexels-markusspiske-144352.jpg",
      {
        x: 0,
        y: 50,
      },
      true
    )
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
