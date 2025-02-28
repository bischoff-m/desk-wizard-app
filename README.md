# Desk Wizard App

Low resource dpi-aware interactive wallpaper desktop app. Built in window system and
display manager.

Built using tauri and nextjs. Needs WallpaperEngine or Lively Wallpaper installed.

## Setup

- Add .env

```bash
npm link -w desk-wizard
npm link -w desk-wizard-calendar
npm link desk-wizard -w desk-wizard-app -w desk-wizard-calendar -w desk-wizard-sample-plugin
npm link desk-wizard-calendar -w desk-wizard-app
npm install
```

If the types are not found, run `npm run build` in the `desk-wizard` and
`desk-wizard-calendar` packages.

## Development

```bash
cd packages/desk-wizard-app
npm run tauri dev
```

## Features

### Wallpaper

[https://www.rocksdanister.com/lively/](https://www.rocksdanister.com/lively/)
