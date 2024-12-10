"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { RemoteComponent } from "@paciolan/remote-component";

const plugins = ["http://localhost:23553/test-plugin.js"];

const url = "http://192.168.56.1:8081/dist/main.js";
// const url = "http://localhost:3000/dist/main.js";

const HelloWorld = ({ name }: { name: string }) => (
    <RemoteComponent url={url} name={name} />
);

export default function PluginTest() {
    const [loadedPlugins, setLoadedPlugins] = useState<any[]>([]);

    async function loadPlugins() {
        // const loaded = await Promise.all(
        //     plugins.map(async (plugin) => (await import(plugin)).default)
        // );
        // setLoadedPlugins(loaded);
    }
    // const Test = dynamic(
    //     () => import(/* webpackIgnore: true */ "http://localhost:3000/dist/main.js"),
    //     { ssr: false }
    // );

    useEffect(() => {
        loadPlugins();
        // <script type="module" src="./hello.js"></script>
        // const url = "http://localhost:23553/test-plugin.js";
        // const script = document.createElement("script");
        // script.src = "http://localhost:3000/dist/main.js";
        // script.async = true;
        // script.type = "module";
        // script.onload = () => {
        //     console.log("loaded");
        // };
        // document.head.appendChild(script);
        // console.log("imports", window);
    }, []);

    return (
        <div>
            <div className="text-2xl">Plugin Test</div>
            {/* {loadedPlugins.map((Plugin, index) => (
                <div key={index}>
                    <Plugin />
                </div>
            ))} */}
            {/* <Test /> */}
            <HelloWorld name="Aiaaiiaiaia" />
        </div>
    );
}
