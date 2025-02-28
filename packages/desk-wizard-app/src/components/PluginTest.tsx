import loadRemoteModule from "@/lib/loadRemoteModule";
import { useEffect, useState } from "react";

export default function PluginTest() {
    const [loadedPlugins, setLoadedPlugins] = useState<any[]>([]);

    async function loadPlugins() {
        const ex = await loadRemoteModule("http://localhost:8081/out/main.js");
        const plugin = new ex.CalendarPlugin();
        setLoadedPlugins(plugin.windows.map((window: any) => window.render));
    }

    useEffect(() => {
        loadPlugins();
    }, []);

    return (
        <div>
            <div className="text-2xl">Plugin Test</div>
            {loadedPlugins.map((Plugin, index) => (
                <div key={index}>
                    <Plugin />
                </div>
            ))}
        </div>
    );
}
