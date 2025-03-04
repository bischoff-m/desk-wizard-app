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
import loadRemoteModule from "@/lib/loadRemoteModule";
import { PluginBase, WidgetManager, WidgetBase, type WidgetClass } from "desk-wizard";
import { createRoot, Root } from "react-dom/client";
import WidgetView from "./WidgetView";

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

function PlaceholderWrapper(props: { manager: WidgetManager; children?: ReactNode }) {
  return <WidgetView>{props.children}</WidgetView>;
}

const pluginUrls = {
  calendar: "http://localhost:4173/desk-wizard-calendar.umd.cjs",
};

type WrapperComponent = FC<{ manager: WidgetManager; children?: ReactNode }>;

class DeskWidgetManager extends WidgetManager {
  widgets: Map<string, WidgetBase> = new Map();
  widgetRoots: Map<string, Root> = new Map();
  wrapperFC: WrapperComponent;

  constructor(wrapperComponent: WrapperComponent) {
    super();
    this.wrapperFC = wrapperComponent;
  }

  public newWidget(key: string, widgetClass: WidgetClass) {
    // Create a new div element for the widget
    const rootContainer = document.getElementById("widget-root");
    const widgetRootElement = document.createElement("div");
    widgetRootElement.id = key;
    rootContainer?.appendChild(widgetRootElement);

    // Create the widget object
    const widget = new widgetClass(this);
    this.widgets.set(key, widget);

    // Create a new root and wrapper
    const widgetRoot = createRoot(widgetRootElement);
    this.widgetRoots.set(key, widgetRoot);
    const wrapperElement = createElement(
      this.wrapperFC,
      {
        manager: this,
      },
      widget.render(),
    );

    // Render the component
    widgetRootElement.style.opacity = "0";
    widgetRoot.render(wrapperElement);
    widget.onLoad?.();
    widgetRootElement.style.opacity = "1";
  }

  public destroyWidget(key: string) {
    const widget = this.widgets.get(key);

    if (!widget) throw new Error("Widget not found");
    if (!widget.attemptClose()) return;

    this.widgets.delete(key);
    this.widgetRoots.delete(key);
  }
}

type PluginClass = new (manager: WidgetManager) => PluginBase;

export default function Home() {
  const [img, setImg] = useState(imgs[Math.floor(Math.random() * imgs.length)]);
  const [program, setProgram] = useState<CanvasProgram<any, any> | null>(null);
  const { canvasProvider } = useCanvas(screens, program);
  const managerRef = useRef<WidgetManager>(new DeskWidgetManager(PlaceholderWrapper));
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
      Plugin: new (manager: WidgetManager) => PluginBase;
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
        <div
          id="widget-root"
          className="absolute overflow-hidden"
          style={{ width: "100vw", height: "100vh" }}
        />
        {/* <CalendarWidget />
                  {plugins.map((plugin, idxPlugin) =>
                      plugin.windows.map((window, idxWindow) => (
                          <div key={idxPlugin + idxWindow}>
                              <WidgetView
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
                              </WidgetView>
                          </div>
                      ))
                  )} */}
      </div>
    </>
  );
}
