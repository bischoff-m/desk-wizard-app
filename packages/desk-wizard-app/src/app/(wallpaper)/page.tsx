"use client";

import {
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
  type FC,
  createElement,
  useRef,
} from "react";
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
import { PluginBase, WindowManager, WindowBase, type WindowClass } from "desk-wizard";
import { createRoot, Root } from "react-dom/client";
import DeskWindow from "./DeskWindow";

const screens = loadScreens();

// interface WindowSize {
//   x: number;
//   y: number;
//   width: number;
//   height: number | null;
// }

// const INITIAL_WINDOW_SIZE: WindowSize = {
//   x: 400,
//   y: 600,
//   width: 1200,
//   height: 720,
// };

function PlaceholderWrapper(props: { manager: WindowManager; children?: ReactNode }) {
  return <DeskWindow>{props.children}</DeskWindow>;
}

const pluginUrls = {
  calendar: "http://localhost:4173/desk-wizard-calendar.umd.cjs",
};

type WrapperComponent = FC<{ manager: WindowManager; children?: ReactNode }>;

class DeskWindowManager extends WindowManager {
  windows: Map<string, WindowBase> = new Map();
  windowRoots: Map<string, Root> = new Map();
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

    // Create the window object
    const window = new windowClass(this);
    this.windows.set(key, window);

    // Create a new root and wrapper
    const windowRoot = createRoot(windowRootElement);
    this.windowRoots.set(key, windowRoot);
    const wrapperElement = createElement(
      this.wrapperFC,
      {
        manager: this,
      },
      window.render(),
    );

    // Render the component
    windowRootElement.style.opacity = "0";
    windowRoot.render(wrapperElement);
    window.onLoad?.();
    windowRootElement.style.opacity = "1";
  }

  public destroyWindow(key: string) {
    const window = this.windows.get(key);

    if (!window) throw new Error("Window not found");
    if (!window.attemptClose()) return;

    this.windows.delete(key);
    this.windowRoots.delete(key);
  }
}

type PluginClass = new (manager: WindowManager) => PluginBase;

export default function Home() {
  const [img, setImg] = useState(imgs[Math.floor(Math.random() * imgs.length)]);
  const [program, setProgram] = useState<CanvasProgram<any, any> | null>(null);
  const { canvasProvider } = useCanvas(screens, program);
  const managerRef = useRef<WindowManager>(new DeskWindowManager(PlaceholderWrapper));
  const pluginsRef = useRef<Record<string, PluginBase | null>>({});
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

  async function loadPlugin(id: string, pluginClass: PluginClass) {
    const plugin: PluginBase = new pluginClass(managerRef.current);
    plugin.onStartup();
    pluginsRef.current[id] = plugin;
  }

  async function pluginFromUrl(url: string) {
    const mod = (await loadRemoteModule(url)) as {
      Plugin: new (manager: WindowManager) => PluginBase;
    };
    if (!mod.Plugin) throw new Error("Plugin class not found in remote module");
    return mod.Plugin;
  }

  useEffect(() => {
    for (const [id, url] of Object.entries(pluginUrls)) {
      if (id in pluginsRef.current) continue;
      pluginsRef.current[id] = null;
      pluginFromUrl(url).then((pluginClass) => loadPlugin(id, pluginClass));
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
