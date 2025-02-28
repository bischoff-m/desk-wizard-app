// https://github.com/Paciolan/remote-module-loader

export default async function loadRemoteModule(url: string): Promise<any> {
    const newRequire = (name: string) => {
        if (name === "react") {
            return require("react");
        }
    };
    const data = await fetch(url).then((res) => res.text());
    const exports = {};
    const newModule = { exports };
    const func = new Function("require", "module", "exports", data);
    func(newRequire, newModule, exports);
    return newModule.exports;
}
