# Desk Wizard App

Low resource dpi-aware interactive wallpaper desktop app. Built in window system and
display manager.

Built using tauri and nextjs. Needs WallpaperEngine or Lively Wallpaper installed.

## Setup

- Add .env

Clone the submodules and install the dependencies:

```bash
git submodule update --init --remote --merge
npm install
```

## Development

```bash
cd packages/desk-wizard-app
npm run tauri dev
```

If a submodule is updated, run:

```bash
git submodule update --remote --merge
```

## Build

```bash
npm run build
```

## Features

### Wallpaper

[https://www.rocksdanister.com/lively/](https://www.rocksdanister.com/lively/)
