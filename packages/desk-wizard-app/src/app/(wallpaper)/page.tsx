"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { Control } from "@/widgets/Wallpaper/classes/programs";
import { loadScreens } from "@/widgets/Wallpaper/classes/ScreenInfo";
import { ScreenWrapper, useCanvas } from "@/widgets/Wallpaper/ProgramProvider";
import { CanvasProgram } from "@/widgets/Wallpaper/classes/CanvasProgram";
import { useTheme } from "next-themes";
import ImagePicker, { imgs } from "../../widgets/Wallpaper/ImagePicker";
import * as tauri from "@tauri-apps/api/core";
// import PluginTest from "@/components/PluginTest";
import WindowRoot from "./WindowRoot";
// import DeskWindow from "./DeskWindow";
import loadRemoteModule from "@/lib/loadRemoteModule";
import { PluginBase, WindowManager, WindowBase, WindowClass } from "desk-wizard";
import { createRoot, Root } from "react-dom/client";
import React from "react";

const screens = loadScreens();

interface WindowSize {
    x: number;
    y: number;
    width: number;
    height: number | null;
}

const INITIAL_WINDOW_SIZE: WindowSize = {
    x: 400,
    y: 600,
    width: 1200,
    height: 720,
};

function PlaceholderWrapper(props: {
    manager: WindowManager;
    children?: React.ReactNode;
}) {
    return <div className="flex w-full h-full">{props.children}</div>;
}

const pluginUrls = {
    calendar: "http://localhost:8081/out/main.js",
};

type WrapperComponent = React.FC<{ manager: WindowManager; children?: React.ReactNode }>;

class DeskWindowManager extends WindowManager {
    windows: Map<string, WindowBase> = new Map();
    windowRoots: Map<string, Root> = new Map();
    windowElements: Map<string, React.ReactElement> = new Map();
    wrapperFC: WrapperComponent;

    constructor(wrapperComponent: WrapperComponent) {
        super();
        this.wrapperFC = wrapperComponent;
    }

    public newWindow(key: string, windowClass: WindowClass) {
        // Create a new div element for the window
        const rootContainer = document.getElementById("desk-window-root");
        const windowRootElement = document.createElement("div");
        windowRootElement.id = key;
        rootContainer?.appendChild(windowRootElement);

        // Create the window and component
        const window = new windowClass(this);
        const element = React.createElement(window.render);
        this.windows.set(key, window);
        this.windowElements.set(key, element);

        // Create a new root and wrapper
        const windowRoot = createRoot(windowRootElement);
        this.windowRoots.set(key, windowRoot);
        const wrapperElement = React.createElement(
            this.wrapperFC,
            {
                manager: this,
            },
            element
        );

        // Render the component
        windowRootElement.style.opacity = "0";
        windowRoot.render(wrapperElement);
        window.onLoad?.();
        windowRootElement.style.opacity = "1";
    }

    public destroyWindow(key: string) {
        const window = this.windows.get(key);
        const component = this.windowElements.get(key);

        if (!window || !component) throw new Error("Window not found");
        if (!window.attemptClose()) return;

        this.windows.delete(key);
        this.windowRoots.delete(key);
        this.windowElements.delete(key);
    }
}

export default function Home() {
    const [img, setImg] = useState(imgs[Math.floor(Math.random() * imgs.length)]);
    const [program, setProgram] = useState<CanvasProgram<any, any> | null>(null);
    const { canvasProvider } = useCanvas(screens, program);
    const managerRef = React.useRef<WindowManager>(
        new DeskWindowManager(PlaceholderWrapper)
    );
    const pluginsRef = React.useRef<Record<string, PluginBase | null>>({});
    useTheme();

    useLayoutEffect(() => {
        // Redirect to /native-app if running in Tauri
        if (tauri.isTauri()) window.location.href = "/native-app";
    }, []);

    useEffect(() => {
        setProgram(Control.PictureFrame.create(img.src, img.offset, img.mirror));
    }, [img]);

    // TODO: Find tauri API object
    // useEffect(() => {
    //     if (!window) {
    //         console.log("No window");
    //         return;
    //     }
    //     console.log(Object.hasOwn(window, "__TAURI__") ? "Tauri" : "Web");
    // }, []);

    async function loadPlugin(id: string, url: string) {
        const mod = await loadRemoteModule(url);
        if (!mod.Plugin) throw new Error("Plugin class not found in remote module");

        const plugin: PluginBase = new mod.Plugin(managerRef.current);
        plugin.onStartup();
        pluginsRef.current[id] = plugin;
        console.log("Loaded plugin", id);
    }

    useEffect(() => {
        for (const [id, url] of Object.entries(pluginUrls)) {
            if (id in pluginsRef.current) continue;
            pluginsRef.current[id] = null;
            loadPlugin(id, url);
        }
    }, []);

    return (
        <>
            <div className="flex w-full h-full absolute overflow-hidden">
                <ScreenWrapper
                    screenId={0}
                    screens={screens}
                    program={program}
                    provider={canvasProvider}
                >
                    {/* <PluginTest /> */}
                </ScreenWrapper>

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
                <WindowRoot>
                    {/* <CalendarWidget />
                    {plugins.map((plugin, idxPlugin) =>
                        plugin.windows.map((window, idxWindow) => (
                            <div key={idxPlugin + idxWindow}>
                                <DeskWindow
                                    default={INITIAL_WINDOW_SIZE}
                                    onResizeStop={(
                                        e,
                                        direction,
                                        ref,
                                        delta,
                                        position
                                    ) => {
                                        plugin.onResizeStop &&
                                            plugin.onResizeStop(
                                                e,
                                                direction,
                                                ref,
                                                delta,
                                                position
                                            );
                                    }}
                                >
                                    {window.render({})}
                                </DeskWindow>
                            </div>
                        ))
                    )} */}
                </WindowRoot>
            </div>
        </>
    );
}
