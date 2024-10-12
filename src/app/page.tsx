"use client";

import { useEffect, useState } from "react";
import { Control } from "./wallpaper/classes/programs";
import { loadScreens } from "./wallpaper/classes/ScreenInfo";
import { ScreenWrapper, useCanvas } from "./wallpaper/components/ProgramProvider";
import { CanvasProgram } from "./wallpaper/classes/CanvasProgram";
import { useTheme } from "next-themes";
import ImagePicker, { imgs } from "./wallpaper/components/ImagePicker";

const screens = loadScreens();

export default function Home() {
    const [img, setImg] = useState(imgs[Math.floor(Math.random() * imgs.length)]);
    const [program, setProgram] = useState<CanvasProgram<any, any> | null>(null);
    const { canvasProvider } = useCanvas(screens, program);
    useTheme();

    useEffect(() => {
        setProgram(Control.PictureFrame.create(img.src, img.offset, img.mirror));
    }, [img]);

    return (
        <>
            <div className="flex w-full h-full absolute overflow-hidden">
                <ScreenWrapper
                    screenId={0}
                    screens={screens}
                    program={program}
                    provider={canvasProvider}
                ></ScreenWrapper>

                <ScreenWrapper
                    screenId={1}
                    screens={screens}
                    program={program}
                    provider={canvasProvider}
                >
                    <ImagePicker setImg={setImg} />
                </ScreenWrapper>

                <ScreenWrapper
                    screenId={2}
                    screens={screens}
                    program={program}
                    provider={canvasProvider}
                ></ScreenWrapper>
            </div>
        </>
    );
}
