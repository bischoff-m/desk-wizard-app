# local-system-api

Node.js server that serves as an API to the operating system.

## Setup

- Add .env

Open [http://localhost:23553](http://localhost:23553) with your browser to see the result.

## Features

### Wallpaper

[https://www.rocksdanister.com/lively/](https://www.rocksdanister.com/lively/)

### Notes

- Inspiration https://crosswire.unseen.co
- GLSL Cheatsheet https://shaderific.com/glsl.html
- A collection of WebGL and WebGPU frameworks and libraries
  https://gist.github.com/dmnsgn/76878ba6903cf15789b712464875cfdc

### Optimizations

- [Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas?retiredLocale=de)
- Maybe the fragment color can be calculated solely from `gl_FragCoord.xy`
  - Like [here](https://twgljs.org#the-tiniest-example)
- Could draw to `OffscreenCanvas` that renders in a service worker
