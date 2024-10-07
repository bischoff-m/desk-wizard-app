# DeskWizard

Low resource dpi-aware interactive wallpaper desktop app.

Built using tauri and nextjs. Needs WallpaperEngine or Lively Wallpaper installed.

## Setup

- Add .env

```bash
npm install
npm run tauri dev
```

## Features

### Wallpaper

[https://www.rocksdanister.com/lively/](https://www.rocksdanister.com/lively/)

### Notes

- Inspiration <https://crosswire.unseen.co>
- GLSL Cheatsheet <https://shaderific.com/glsl.html>
- A collection of WebGL and WebGPU frameworks and libraries
  <https://gist.github.com/dmnsgn/76878ba6903cf15789b712464875cfdc>
- This looks nice <https://www.istockphoto.com/de/video/abstrakte-gitter-hintergrund-schleife-gm1171924854-324846096>

### Optimizations

- [Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas?retiredLocale=de)
- Maybe the fragment color can be calculated solely from `gl_FragCoord.xy`
  - Like [here](https://twgljs.org#the-tiniest-example)
- Could draw to `OffscreenCanvas` that renders in a service worker
