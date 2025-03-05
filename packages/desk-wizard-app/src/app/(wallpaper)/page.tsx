"use client";

import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { Control } from "@/widgets/Wallpaper/classes/programs";
import { loadScreens } from "@/widgets/Wallpaper/classes/ScreenInfo";
import { ScreenWrapper, useCanvas } from "@/widgets/Wallpaper/ProgramProvider";
import { CanvasProgram } from "@/widgets/Wallpaper/classes/CanvasProgram";
import { useTheme } from "next-themes";
import { imgs } from "../../widgets/Wallpaper/ImagePicker";
import * as tauri from "@tauri-apps/api/core";
import loadRemoteModule from "@/lib/loadRemoteModule";
import { PluginBase, PluginClass, type WidgetManager } from "desk-wizard";
import { DeskWidgetManager } from "@/lib/DeskWidgetManager";
import { ImagePickerWidget } from "@/widgets/Wallpaper/ImagePickerWidget";
import { Wallpaper } from "lucide-react";
import { Button } from "@/components/ui/button";

const screens = loadScreens();

const pluginUrls = {
  calendar: "http://localhost:4173/desk-wizard-calendar.umd.cjs",
};

export default function Home() {
  const [img, setImg] = useState(imgs[Math.floor(Math.random() * imgs.length)]);
  const [program, setProgram] = useState<CanvasProgram<any, any> | null>(null);
  const { canvasProvider } = useCanvas(screens, program);
  const managerRef = useRef<WidgetManager>(new DeskWidgetManager());
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
      if (id === "calendar") continue;
      pluginsRef.current[id] = null;
      pluginFromUrl(url).then((pluginClass) => loadPlugin(id, pluginClass));
    }
  }, []);

  useEffect(() => {}, []);

  return (
    <>
      <div className="flex w-full h-full absolute overflow-hidden">
        <ScreenWrapper
          screenId={0}
          screens={screens}
          program={program}
          provider={canvasProvider}
        />
        <ScreenWrapper
          screenId={1}
          screens={screens}
          program={program}
          provider={canvasProvider}
        >
          <Button
            className="cursor-pointer"
            onClick={() =>
              managerRef.current.newWidget(
                new ImagePickerWidget("image-picker-1", managerRef.current, setImg),
              )
            }
          >
            <Wallpaper />
          </Button>
        </ScreenWrapper>
        <ScreenWrapper
          screenId={2}
          screens={screens}
          program={program}
          provider={canvasProvider}
        />

        <div
          id="widget-root"
          className="absolute overflow-hidden bg-opacity-0"
          style={{ width: "100vw", height: "100vh", visibility: "hidden" }}
        />
      </div>
    </>
  );
}
