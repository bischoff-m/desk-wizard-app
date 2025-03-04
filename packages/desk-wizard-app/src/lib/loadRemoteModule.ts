export default async function loadRemoteModule(url: string): Promise<unknown> {
  const data = await fetch(url, { cache: "no-store", }).then((res) => res.text());
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const newRequire = (name: string) => (name === "react" ? require("react") : undefined);

  // Reference:
  // https://github.com/Paciolan/remote-module-loader
  const exports = {};
  const func = new Function("require", "module", "exports", data);
  func(newRequire, {}, exports);

  if (!exports)
    throw new Error(
      `Failed to import module from ${url} - Module: ${JSON.stringify(exports)}`,
    );
  return exports;
}
