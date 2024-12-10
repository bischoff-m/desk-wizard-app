// https://github.com/Paciolan/remote-module-loader

export default async function loadRemoteModule(url: string): Promise<any> {
    const newRequire = (name: string) => {
        if (name === "react") {
            return require("react");
        }
    };
    const data = await fetch(url).then((res) => res.text());
    const exports = {};
    const module = { exports };
    const func = new Function("require", "module", "exports", data);
    func(newRequire, module, exports);
    return module.exports;
}
